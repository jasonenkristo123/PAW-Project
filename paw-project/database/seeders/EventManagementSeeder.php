<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use App\Models\Venue;
use Brick\Math\BigDecimal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EventManagementSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@agendain.test'],
            [
                'name' => 'Admin Agendain',
                'password' => bcrypt('password'),
                'role' => User::ROLE_ADMIN,
                'phone_number' => '+6281122334455',
                'email_verified_at' => now(),
            ]
        );
        $admin->role = User::ROLE_ADMIN;
        $admin->save();

        $customer = User::firstOrCreate(
            ['email' => 'user@agendain.test'],
            [
                'name' => 'Budi Santoso',
                'password' => bcrypt('password'),
                'role' => User::ROLE_USER,
                'phone_number' => '+6281234567890',
                'email_verified_at' => now(),
            ]
        );

        // 2. Categories
        $categoryData = [
            'Workshop' => 'Hands-on creative and skill-building sessions.',
            'Music' => 'Live concerts, acoustic performances, and musical gatherings.',
            'Technology' => 'Conferences, coding summits, and tech talks.',
            'Competition' => 'Hackathons, pitch battles, and creative competitions.',
            'Seminar' => 'Expert lectures and professional masterclasses.',
        ];

        $categories = [];
        foreach ($categoryData as $name => $description) {
            $categories[$name] = Category::firstOrCreate(
                ['name' => $name],
                [
                    'description' => $description,
                    'status' => Category::STATUS_ACTIVE,
                ]
            );
        }

        // 3. Venues
        $venueData = [
            'Creative Hall' => ['address' => 'Jl. Sudirman No. 24, Jakarta Pusat', 'capacity' => 100],
            'Rooftop Amphitheater' => ['address' => 'Senayan Park Level 5, Jakarta', 'capacity' => 200],
            'Tech Academy' => ['address' => 'Jl. Gatot Subroto Kav. 18, Jakarta', 'capacity' => 500],
            'Community Space' => ['address' => 'Jl. Kemang Raya No. 12, Jakarta', 'capacity' => 150],
            'Artisan Roastery' => ['address' => 'Jl. Senopati No. 42, Jakarta', 'capacity' => 80],
            'Grand Ballroom' => ['address' => 'Jakarta Convention Center, SCBD', 'capacity' => 300],
            'Garden Terrace' => ['address' => 'Jl. Menteng No. 5, Jakarta', 'capacity' => 120],
        ];

        $venues = [];
        foreach ($venueData as $name => $info) {
            $venues[$name] = Venue::firstOrCreate(
                ['name' => $name],
                [
                    'address' => $info['address'],
                    'capacity' => $info['capacity'],
                    'status' => Venue::STATUS_ACTIVE,
                ]
            );
        }

        // 4. Events
        $eventFixtures = [
            [
                'title' => 'Creative Design Workshop',
                'category' => 'Workshop',
                'venue' => 'Creative Hall',
                'days' => 14,
                'time' => '09:00:00',
                'price' => '50000.00',
                'quota' => 60,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Spend a few inspiring hours learning by doing. Our hosts will guide you through practical exercises, share their favorite techniques, and leave plenty of room for questions.',
                'whats_included' => "Admission to the full session\nMaterials and guided activities\nLight refreshments",
                'what_to_bring' => "Your booking reference\nA notebook and your curiosity\nA laptop for design exercises",
            ],
            [
                'title' => 'Sunset Indie Sessions',
                'category' => 'Music',
                'venue' => 'Rooftop Amphitheater',
                'days' => 16,
                'time' => '19:30:00',
                'price' => '85000.00',
                'quota' => 150,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'A little music. A memorable evening. Enjoy rooftop views and intimate acoustic sets from top independent musicians.',
                'whats_included' => "Venue admission\nWelcome drink\nExclusive merchandise sticker pack",
                'what_to_bring' => "E-ticket booking pass\nWarm jacket",
            ],
            [
                'title' => 'AI & Fullstack Dev Summit',
                'category' => 'Technology',
                'venue' => 'Tech Academy',
                'days' => 22,
                'time' => '10:00:00',
                'price' => '0.00',
                'quota' => 300,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Explore what comes next in technology. Dive deep into generative AI workflows, reactive fullstack architectures, and production scaling.',
                'whats_included' => "Full day access to talks\nLunch buffet\nDigital certificate of participation",
                'what_to_bring' => "E-ticket pass\nLaptop and charger",
            ],
            [
                'title' => 'National Startup Pitch Battle',
                'category' => 'Competition',
                'venue' => 'Community Space',
                'days' => 26,
                'time' => '13:00:00',
                'price' => '0.00',
                'quota' => 100,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Big ideas deserve a stage. Watch the most promising early-stage founders pitch to top Indonesian venture capital investors.',
                'whats_included' => "Spectator badge\nNetworking session access",
                'what_to_bring' => "E-ticket pass",
            ],
            [
                'title' => 'Coffee Brewing & Cupping Masterclass',
                'category' => 'Workshop',
                'venue' => 'Artisan Roastery',
                'days' => 29,
                'time' => '11:00:00',
                'price' => '75000.00',
                'quota' => 40,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Find your next favorite cup. Learn origin notes, sensory analysis, and pour-over dial-in techniques with certified Q-Graders.',
                'whats_included' => "Cupping session with 5 single-origin beans\nBrew guide booklet\n100g sample coffee beans to take home",
                'what_to_bring' => "Your curiosity and palate",
            ],
            [
                'title' => 'Modern Product Management',
                'category' => 'Seminar',
                'venue' => 'Grand Ballroom',
                'days' => 33,
                'time' => '14:00:00',
                'price' => '120000.00',
                'quota' => 200,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Build better products with better questions. A masterclass on product discovery, customer obsession, and roadmapping frameworks.',
                'whats_included' => "Seminar admission\nPM framework workbook\nCoffee break refreshments",
                'what_to_bring' => "Notebook or tablet for note-taking",
            ],
        ];

        $events = [];
        foreach ($eventFixtures as $fixture) {
            $cat = $categories[$fixture['category']];
            $ven = $venues[$fixture['venue']];

            $events[$fixture['title']] = Event::firstOrCreate(
                ['title' => $fixture['title']],
                [
                    'category_id' => $cat->id,
                    'venue_id' => $ven->id,
                    'description' => $fixture['description'],
                    'whats_included' => $fixture['whats_included'],
                    'what_to_bring' => $fixture['what_to_bring'],
                    'date' => now('Asia/Jakarta')->addDays($fixture['days'])->format('Y-m-d'),
                    'time' => $fixture['time'],
                    'price' => $fixture['price'],
                    'quota' => $fixture['quota'],
                    'status' => $fixture['status'],
                ]
            );
        }

        // 5. Initial Bookings for Demonstration
        $bookingFixtures = [
            [
                'event_title' => 'Creative Design Workshop',
                'quantity' => 2,
                'status' => Booking::STATUS_CONFIRMED,
            ],
            [
                'event_title' => 'Sunset Indie Sessions',
                'quantity' => 1,
                'status' => Booking::STATUS_PENDING,
            ],
            [
                'event_title' => 'AI & Fullstack Dev Summit',
                'quantity' => 1,
                'status' => Booking::STATUS_CONFIRMED,
            ],
            [
                'event_title' => 'Coffee Brewing & Cupping Masterclass',
                'quantity' => 1,
                'status' => Booking::STATUS_CANCELLED,
            ],
        ];

        foreach ($bookingFixtures as $index => $bFix) {
            $event = $events[$bFix['event_title']];
            $subtotal = BigDecimal::of($event->price)->multipliedBy($bFix['quantity']);
            $fee = (float) $event->price > 0 ? 5000 : 0;
            $total = (string) $subtotal->plus($fee)->toScale(2);

            Booking::firstOrCreate(
                [
                    'booking_code' => 'BK-SEEDED-00'.($index + 1),
                ],
                [
                    'user_id' => $customer->id,
                    'event_id' => $event->id,
                    'ticket_quantity' => $bFix['quantity'],
                    'total_price' => $total,
                    'status' => $bFix['status'],
                    'booking_date' => now()->subHours($index * 4),
                ]
            );
        }
    }
}
