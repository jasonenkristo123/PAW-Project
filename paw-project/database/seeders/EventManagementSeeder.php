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

        $categoryData = [
            'Workshop' => [
                'description' => 'Hands-on learning, practical lab sessions, and design sprints',
                'status' => Category::STATUS_ACTIVE,
            ],
            'Seminar' => [
                'description' => 'Talks, panel discussions, and educational masterclasses',
                'status' => Category::STATUS_ACTIVE,
            ],
            'Technology' => [
                'description' => 'Technology, programming, AI, and digital innovation',
                'status' => Category::STATUS_ACTIVE,
            ],
            'Music' => [
                'description' => 'Concerts, indie gigs, and live acoustic music experiences',
                'status' => Category::STATUS_ACTIVE,
            ],
            'Community' => [
                'description' => 'Community gatherings, meetups, and social networking activities',
                'status' => Category::STATUS_ACTIVE,
            ],
            'Competition' => [
                'description' => 'Hackathons, pitch battles, and creative design awards',
                'status' => Category::STATUS_INACTIVE,
            ],
        ];

        $categories = [];
        foreach ($categoryData as $name => $info) {
            $categories[$name] = Category::firstOrCreate(
                ['name' => $name],
                [
                    'description' => $info['description'],
                    'status' => $info['status'],
                ]
            );
        }

        $venueData = [
            'Creative Hall' => ['address' => 'Jl. Sudirman No. 24, Jakarta Pusat', 'capacity' => 100],
            'Rooftop Amphitheater' => ['address' => 'Senayan Park Level 5, Jakarta', 'capacity' => 200],
            'Tech Academy' => ['address' => 'Jl. Gatot Subroto Kav. 18, Jakarta', 'capacity' => 500],
            'Community Space' => ['address' => 'Jl. Kemang Raya No. 12, Jakarta', 'capacity' => 150],
            'Artisan Roastery' => ['address' => 'Jl. Senopati No. 42, Jakarta', 'capacity' => 80],
            'Grand Ballroom' => ['address' => 'Jakarta Convention Center, SCBD', 'capacity' => 300],
            'Garden Terrace' => ['address' => 'Jl. Menteng No. 5, Jakarta', 'capacity' => 120],
            'Studio Pixel Hub' => ['address' => 'Jl. TB Simatupang No. 88, Jakarta Selatan', 'capacity' => 90],
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
                'what_to_bring' => 'Your curiosity and palate',
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
                'what_to_bring' => 'Notebook or tablet for note-taking',
            ],
            [
                'title' => 'UI/UX Prototyping in Figma',
                'category' => 'Workshop',
                'venue' => 'Tech Academy',
                'days' => 7,
                'time' => '10:00:00',
                'price' => '45000.00',
                'quota' => 50,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Master interactive prototypes and smart animations in Figma.',
                'whats_included' => 'Figma templates, Certificate',
                'what_to_bring' => 'Laptop with Figma installed',
            ],
            [
                'title' => 'Ceramic Pottery Hand-Building',
                'category' => 'Workshop',
                'venue' => 'Creative Hall',
                'days' => 12,
                'time' => '13:00:00',
                'price' => '90000.00',
                'quota' => 30,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Shape raw clay into functional decorative ceramic pieces.',
                'whats_included' => 'Clay, Glazing and Firing service',
                'what_to_bring' => 'Clothes you do not mind getting dusty',
            ],
            [
                'title' => 'Digital Illustration with Procreate',
                'category' => 'Workshop',
                'venue' => 'Studio Pixel Hub',
                'days' => 18,
                'time' => '15:00:00',
                'price' => '65000.00',
                'quota' => 35,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Techniques for character drawing, color palettes, and lighting in Procreate.',
                'whats_included' => 'Brush pack download, Reference assets',
                'what_to_bring' => 'iPad with Apple Pencil',
            ],
            [
                'title' => 'Artisan Sourdough Baking',
                'category' => 'Workshop',
                'venue' => 'Artisan Roastery',
                'days' => 21,
                'time' => '09:00:00',
                'price' => '110000.00',
                'quota' => 20,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Fermentation science, kneading, and scoring your own sourdough loaf.',
                'whats_included' => 'Live sourdough starter jar, Banneton basket',
                'what_to_bring' => 'Apron',
            ],
            [
                'title' => 'Microcontroller & IoT Hands-on',
                'category' => 'Workshop',
                'venue' => 'Tech Academy',
                'days' => 25,
                'time' => '10:00:00',
                'price' => '80000.00',
                'quota' => 40,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Build sensor-driven IoT nodes with ESP32 and MQTT.',
                'whats_included' => 'ESP32 development board kit to take home',
                'what_to_bring' => 'Laptop with USB-A/C port',
            ],
            [
                'title' => 'Mobile Photography & Lightroom',
                'category' => 'Workshop',
                'venue' => 'Garden Terrace',
                'days' => 28,
                'time' => '16:00:00',
                'price' => '40000.00',
                'quota' => 45,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Capture golden hour lighting and master mobile color grading presets.',
                'whats_included' => 'Custom Lightroom preset pack',
                'what_to_bring' => 'Smartphone with camera',
            ],
            [
                'title' => 'Future of Cloud Infrastructure',
                'category' => 'Seminar',
                'venue' => 'Grand Ballroom',
                'days' => 15,
                'time' => '13:00:00',
                'price' => '150000.00',
                'quota' => 180,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Distributed systems, serverless paradigms, and edge computing.',
                'whats_included' => 'Seminar pass, lunch, slide deck access',
                'what_to_bring' => 'Notebook',
            ],
            [
                'title' => 'Fintech Regulatory Compliance in SE Asia',
                'category' => 'Seminar',
                'venue' => 'Grand Ballroom',
                'days' => 20,
                'time' => '09:30:00',
                'price' => '200000.00',
                'quota' => 120,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Deep dive into digital banking frameworks, AML guidelines, and fintech policies.',
                'whats_included' => 'Compliance handbook, catering buffet',
                'what_to_bring' => 'Business cards',
            ],
            [
                'title' => 'Sustainable Architecture & Urban Design',
                'category' => 'Seminar',
                'venue' => 'Creative Hall',
                'days' => 31,
                'time' => '14:00:00',
                'price' => '50000.00',
                'quota' => 90,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Green building materials, energy simulation, and human-centric spaces.',
                'whats_included' => 'Case study dossier',
                'what_to_bring' => 'Note app or notebook',
            ],
            [
                'title' => 'Leadership in Remote Engineering Teams',
                'category' => 'Seminar',
                'venue' => 'Community Space',
                'days' => 35,
                'time' => '10:00:00',
                'price' => '75000.00',
                'quota' => 80,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Asynchronous workflows, psychological safety, and metric-driven engineering culture.',
                'whats_included' => 'Management template bundle',
                'what_to_bring' => 'Questions for AMA panel',
            ],
            [
                'title' => 'Kubernetes & Container Orchestration',
                'category' => 'Technology',
                'venue' => 'Tech Academy',
                'days' => 11,
                'time' => '13:30:00',
                'price' => '0.00',
                'quota' => 150,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Deploying high-availability clusters with GitOps and ArgoCD.',
                'whats_included' => 'Cluster sandbox access during talk',
                'what_to_bring' => 'Laptop',
            ],
            [
                'title' => 'Cybersecurity Blue Team Defense',
                'category' => 'Technology',
                'venue' => 'Tech Academy',
                'days' => 19,
                'time' => '10:00:00',
                'price' => '50000.00',
                'quota' => 100,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Incident response, SIEM telemetry, and threat hunting in enterprise networks.',
                'whats_included' => 'Virtual lab access',
                'what_to_bring' => 'Laptop with OpenVPN',
            ],
            [
                'title' => 'High-Performance Rust for Web Services',
                'category' => 'Technology',
                'venue' => 'Studio Pixel Hub',
                'days' => 24,
                'time' => '15:00:00',
                'price' => '0.00',
                'quota' => 80,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Memory safety without garbage collection: Axum, Tokio, and SQLx in production.',
                'whats_included' => 'Cheat sheet and benchmark demo repository',
                'what_to_bring' => 'Laptop with rustup installed',
            ],
            [
                'title' => 'Jazz Under the Stars',
                'category' => 'Music',
                'venue' => 'Garden Terrace',
                'days' => 17,
                'time' => '20:00:00',
                'price' => '95000.00',
                'quota' => 110,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Live jazz quintet playing classics and modern improvisations in a breezy garden setting.',
                'whats_included' => 'Mocktail beverage, reserved table seat',
                'what_to_bring' => 'Warm clothing for evening breeze',
            ],
            [
                'title' => 'Electronic Ambient Soundscape Showcase',
                'category' => 'Music',
                'venue' => 'Rooftop Amphitheater',
                'days' => 30,
                'time' => '21:00:00',
                'price' => '70000.00',
                'quota' => 140,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Modular synthesizers, tape loops, and immersive visual projections.',
                'whats_included' => 'Event pass and sticker',
                'what_to_bring' => 'Earplugs if sensitive to sub-bass',
            ],
            [
                'title' => 'Jakarta Indie Creators Mixer',
                'category' => 'Community',
                'venue' => 'Community Space',
                'days' => 8,
                'time' => '18:30:00',
                'price' => '25000.00',
                'quota' => 100,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Connect with podcasters, writers, illustrators, and indie developers in Jakarta.',
                'whats_included' => 'Snacks and soft drinks',
                'what_to_bring' => 'Portfolio links or project demos',
            ],
            [
                'title' => 'Open Source Contribution Sprint',
                'category' => 'Community',
                'venue' => 'Community Space',
                'days' => 13,
                'time' => '10:00:00',
                'price' => '0.00',
                'quota' => 60,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Pair program on good-first-issues for popular open-source repositories.',
                'whats_included' => 'Pizza lunch and stickers',
                'what_to_bring' => 'Laptop and GitHub account',
            ],
            [
                'title' => 'Board Game Social Night',
                'category' => 'Community',
                'venue' => 'Creative Hall',
                'days' => 23,
                'time' => '19:00:00',
                'price' => '30000.00',
                'quota' => 50,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Strategy games, party games, and social deduction with fellow enthusiasts.',
                'whats_included' => 'Unlimited game library access, tea and cookies',
                'what_to_bring' => 'Good sportsmanship',
            ],
            [
                'title' => 'Book Club: Speculative Fiction Discussions',
                'category' => 'Community',
                'venue' => 'Artisan Roastery',
                'days' => 27,
                'time' => '15:30:00',
                'price' => '35000.00',
                'quota' => 25,
                'status' => Event::STATUS_PUBLISHED,
                'description' => 'Monthly literary discussion covering world-building, societal critique, and sci-fi novellas.',
                'whats_included' => 'Hot beverage of choice',
                'what_to_bring' => 'Copy of this month book',
            ],
            [
                'title' => 'HackJakarta 48h AI Hackathon',
                'category' => 'Competition',
                'venue' => 'Tech Academy',
                'days' => 32,
                'time' => '08:00:00',
                'price' => '0.00',
                'quota' => 200,
                'status' => Event::STATUS_DRAFT,
                'description' => 'Build innovative AI agent solutions in 48 hours for a total prize pool of Rp 50.000.000.',
                'whats_included' => 'Meals, cloud credits, mentor access, prize pool eligibility',
                'what_to_bring' => 'Team of 2-4 and development hardware',
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
