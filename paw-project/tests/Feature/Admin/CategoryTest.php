<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public static function categoryRoutes(): array
    {
        return [
            'index' => ['GET', 'admin.categories.index', false],
            'create' => ['GET', 'admin.categories.create', false],
            'store' => ['POST', 'admin.categories.store', false],
            'show' => ['GET', 'admin.categories.show', true],
            'edit' => ['GET', 'admin.categories.edit', true],
            'update' => ['PUT', 'admin.categories.update', true],
            'destroy' => ['DELETE', 'admin.categories.destroy', true],
        ];
    }

    #[DataProvider('categoryRoutes')]
    public function test_guests_must_log_in_for_every_category_route(string $method, string $name, bool $usesCategory): void
    {
        $category = Category::factory()->create();

        $this->call($method, route($name, $usesCategory ? $category : []), $this->payload())
            ->assertRedirect(route('login'));

        $this->assertDatabaseCount('categories', 1);
    }

    #[DataProvider('categoryRoutes')]
    public function test_regular_users_cannot_access_any_category_route(string $method, string $name, bool $usesCategory): void
    {
        $category = Category::factory()->create();
        $this->actingAs(User::factory()->create());

        $this->call($method, route($name, $usesCategory ? $category : []), $this->payload())
            ->assertForbidden();

        $this->assertDatabaseCount('categories', 1);
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => $category->name]);
    }

    public function test_admin_index_displays_categories_with_stats_and_pagination(): void
    {
        Category::factory()->count(6)->create(['status' => Category::STATUS_ACTIVE]);
        $inactive = Category::factory()->create(['status' => Category::STATUS_INACTIVE]);

        $this->actingAs($this->admin())
            ->get(route('admin.categories.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/categories')
                ->has('categories.data', 6)
                ->where('categories.total', 7)
                ->where('stats.categories', 7)
                ->where('stats.active', 6)
                ->where('stats.inactive', 1)
            );
    }

    public function test_admin_can_filter_categories_by_search_and_status(): void
    {
        Category::factory()->create(['name' => 'Workshop Tech', 'status' => Category::STATUS_ACTIVE]);
        Category::factory()->create(['name' => 'Seminar Business', 'status' => Category::STATUS_ACTIVE]);
        Category::factory()->create(['name' => 'Gaming Workshop', 'status' => Category::STATUS_INACTIVE]);

        $this->actingAs($this->admin())
            ->get(route('admin.categories.index', ['search' => 'Workshop', 'status' => 'active']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/categories')
                ->has('categories.data', 1)
                ->where('categories.data.0.name', 'Workshop Tech')
            );
    }

    public function test_admin_can_create_a_category(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'name' => 'Art & Design',
                'description' => 'Creative workshops and exhibitions',
                'status' => 'active',
            ])
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Art & Design',
            'status' => 'active',
        ]);
    }

    public function test_admin_cannot_create_duplicate_category_name(): void
    {
        Category::factory()->create(['name' => 'Technology']);

        $this->actingAs($this->admin())
            ->post(route('admin.categories.store'), [
                'name' => 'Technology',
                'description' => 'Duplicate category test',
                'status' => 'active',
            ])
            ->assertSessionHasErrors(['name']);
    }

    public function test_admin_can_view_category_details(): void
    {
        $category = Category::factory()->create(['name' => 'Music Festivals']);

        $this->actingAs($this->admin())
            ->get(route('admin.categories.show', $category))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/categories')
                ->where('dialog.mode', 'show')
                ->where('dialog.category.name', 'Music Festivals')
            );
    }

    public function test_admin_can_update_a_category(): void
    {
        $category = Category::factory()->create(['name' => 'Old Category Name']);

        $this->actingAs($this->admin())
            ->put(route('admin.categories.update', $category), [
                'name' => 'Updated Category Name',
                'description' => 'Updated description text',
                'status' => 'inactive',
            ])
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Category Name',
            'status' => 'inactive',
        ]);
    }

    public function test_admin_can_delete_category_without_events(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin())
            ->delete(route('admin.categories.destroy', $category))
            ->assertRedirect(route('admin.categories.index'));

        $this->assertModelMissing($category);
    }

    public function test_admin_cannot_delete_category_with_events(): void
    {
        $category = Category::factory()->create();
        Event::factory()->for($category)->create();

        $this->actingAs($this->admin())
            ->delete(route('admin.categories.destroy', $category))
            ->assertSessionHasErrors(['category']);

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    private function admin(): User
    {
        $user = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user->role = User::ROLE_ADMIN;
        $user->save();

        return $user;
    }

    private function payload(): array
    {
        return [
            'name' => 'Payload Category',
            'description' => 'A valid test payload',
            'status' => 'active',
        ];
    }
}
