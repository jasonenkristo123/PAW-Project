<?php

namespace App\Support;

/**
 * @phpstan-type DemoEvent array{id: int, title: string, category: string, tagline: string, date: string, time: string, end_time: string, venue: string, address: string, price: int, quota: int, remaining: int, image: string, organizer: string, description: string, included: list<string>, bring: list<string>}
 */
class DemoEventCatalog
{
    /** @return list<DemoEvent> */
    public static function all(): array
    {
        $fixtures = [
            [1, 'Creative Design Workshop', 'Workshop', 'Make something you are proud of.', 14, '09:00', '12:00', 'Creative Hall', 'Jl. Sudirman No. 24, Jakarta Pusat', 50000, 60, 36, 'workshop', 'Agendain Studio'],
            [2, 'Sunset Indie Sessions', 'Music', 'A little music. A memorable evening.', 16, '19:30', '22:00', 'Rooftop Amphitheater', 'Senayan Park Level 5, Jakarta', 85000, 150, 53, 'music', 'Sunset Collective'],
            [3, 'AI & Fullstack Dev Summit', 'Technology', 'Explore what comes next in technology.', 22, '10:00', '16:00', 'Tech Academy', 'Jl. Gatot Subroto Kav. 18, Jakarta', 0, 300, 82, 'technology', 'Build Together'],
            [4, 'National Startup Pitch Battle', 'Competition', 'Big ideas deserve a stage.', 26, '13:00', '17:00', 'Community Space', 'Jl. Kemang Raya No. 12, Jakarta', 0, 100, 28, 'competition', 'Founders Circle'],
            [5, 'Coffee Brewing & Cupping Masterclass', 'Workshop', 'Find your next favorite cup.', 29, '11:00', '14:00', 'Artisan Roastery', 'Jl. Senopati No. 42, Jakarta', 75000, 40, 12, 'coffee', 'Artisan Coffee Club'],
            [6, 'Modern Product Management', 'Seminar', 'Build better products with better questions.', 33, '14:00', '17:00', 'Grand Ballroom', 'Jakarta Convention Center, SCBD', 120000, 200, 67, 'seminar', 'Product People'],
            [7, 'Designing for Everyday Life', 'Workshop', 'Small details, meaningful experiences.', 36, '10:00', '13:00', 'Creative Hall', 'Jl. Sudirman No. 24, Jakarta Pusat', 65000, 50, 21, 'workshop', 'Agendain Studio'],
            [8, 'An Evening of Acoustic Stories', 'Music', 'Slow down and listen closely.', 40, '18:00', '21:00', 'Garden Terrace', 'Jl. Menteng No. 5, Jakarta', 95000, 80, 0, 'music', 'Sunset Collective'],
            [9, 'The Art of a Good Cup', 'Workshop', 'A morning of good coffee and good company.', -20, '09:00', '12:00', 'Artisan Roastery', 'Jl. Senopati No. 42, Jakarta', 60000, 40, 0, 'coffee', 'Artisan Coffee Club'],
        ];

        return array_values(array_map(function (array $fixture): array {
            [$id, $title, $category, $tagline, $days, $time, $endTime, $venue, $address, $price, $quota, $remaining, $image, $organizer] = $fixture;

            return [
                'id' => $id, 'title' => $title, 'category' => $category, 'tagline' => $tagline,
                'date' => now('Asia/Jakarta')->addDays($days)->format('Y-m-d'),
                'time' => $time, 'end_time' => $endTime, 'venue' => $venue, 'address' => $address,
                'price' => $price, 'quota' => $quota, 'remaining' => $remaining,
                'image' => '/images/events/'.$image.'.jpg', 'organizer' => $organizer,
                'description' => $category === 'Workshop'
                    ? 'Spend a few inspiring hours learning by doing. Our hosts will guide you through practical exercises, share their favorite techniques, and leave plenty of room for questions. Come curious, meet people with a shared interest, and leave with something new to take into your everyday life.'
                    : 'Bring your curiosity and make room for a new experience. Join a welcoming community for thoughtful conversations, fresh perspectives, and memorable moments. Our hosts have planned an engaging session with time to connect and explore together.',
                'included' => ['Admission to the full session', 'Materials and guided activities', 'Light refreshments', 'A chance to meet the community'],
                'bring' => ['Your booking reference', 'A notebook and your curiosity', 'A laptop for design or technology sessions'],
            ];
        }, $fixtures));
    }

    /** @return DemoEvent */
    public static function find(int $id): array
    {
        foreach (self::all() as $event) {
            if ($event['id'] === $id) {
                return $event;
            }
        }

        abort(404);
    }
}
