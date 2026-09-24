<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Services\CloudinaryService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $covers = $this->uploadBlogCovers();
        $coverFiles = array_values($covers);
        $topics = $this->topics();

        for ($i = 1; $i <= 200; $i++) {
            $topic = $topics[($i - 1) % count($topics)];
            $edition = (int) ceil($i / count($topics));
            $title = $edition === 1
                ? $topic['title']
                : sprintf('%s — Guide %d', $topic['title'], $edition);

            $slugBase = Str::slug($title);
            $slug = $slugBase.'-'.$i;

            $excerpt = $topic['excerpt'];
            $body = $this->buildBody($topic, $edition, $i);
            $cover = $coverFiles[($i - 1) % count($coverFiles)];

            BlogPost::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'excerpt' => $excerpt,
                    'body' => $body,
                    'cover_image' => $cover,
                    'author_name' => $topic['author'],
                    'category' => $topic['category'],
                    'meta_title' => $title.' | V2005 Blog',
                    'meta_description' => Str::limit($excerpt, 155, ''),
                    'is_published' => true,
                    'published_at' => now()->subDays(200 - $i)->subHours($i % 12),
                ]
            );
        }

        $this->command?->info('Seeded 200 blog posts with Cloudinary covers.');
    }

    /**
     * @return array<string, string> filename => secure_url
     */
    private function uploadBlogCovers(): array
    {
        $publicRoot = realpath(base_path('../user-frontend/public'));
        if ($publicRoot === false) {
            throw new RuntimeException(
                'Cannot find user-frontend/public for Cloudinary blog seeding.'
            );
        }

        $dir = $publicRoot.DIRECTORY_SEPARATOR.'images'.DIRECTORY_SEPARATOR.'blog';
        if (! is_dir($dir)) {
            throw new RuntimeException("Blog cover directory missing: {$dir}");
        }

        $cloudinary = app(CloudinaryService::class);
        $map = [];

        foreach (glob($dir.DIRECTORY_SEPARATOR.'*.jpg') ?: [] as $absolute) {
            $filename = basename($absolute);
            $publicId = pathinfo($filename, PATHINFO_FILENAME);
            $this->command?->info("Uploading blog cover: {$filename}");
            $uploaded = $cloudinary->uploadLocalFile($absolute, $publicId, 'v2005/blog');
            $map[$filename] = $uploaded['secure_url'];
        }

        if ($map === []) {
            throw new RuntimeException('No blog cover images found to upload.');
        }

        return $map;
    }

    /**
     * @return list<array{title: string, category: string, excerpt: string, author: string, focus: string}>
     */
    private function topics(): array
    {
        return [
            [
                'title' => 'How to Choose Wireless Noise-Cancelling Headphones',
                'category' => 'Audio',
                'excerpt' => 'A practical buyer’s guide to ANC, battery life, fit, and everyday comfort.',
                'author' => 'Auralis Desk',
                'focus' => 'headphones and daily commuting sound quality',
            ],
            [
                'title' => 'Air Fryer Meal Prep for Busy Weeks',
                'category' => 'Kitchen',
                'excerpt' => 'Save time with dual-zone cooking tips, batch recipes, and cleanup shortcuts.',
                'author' => 'HomeForge Kitchen',
                'focus' => 'air fryers and weeknight meal prep',
            ],
            [
                'title' => 'Build a Clean RGB Gaming Desk Setup',
                'category' => 'Gaming',
                'excerpt' => 'From keyboard feel to cable management — dial in a focused gaming station.',
                'author' => 'ChargeLab Labs',
                'focus' => 'mechanical keyboards and gaming desks',
            ],
            [
                'title' => 'Travel Packing with a 40L Duffel',
                'category' => 'Travel',
                'excerpt' => 'Carry-on packing lists and organization tricks for short trips and weekends.',
                'author' => 'VoltRide Travel',
                'focus' => 'duffel bags and weekend travel packing',
            ],
            [
                'title' => 'Why a Monitor Light Bar Beats Overhead Glare',
                'category' => 'Workspace',
                'excerpt' => 'Reduce eye strain with bias lighting, placement tips, and desk ergonomics.',
                'author' => 'DeskForm Studio',
                'focus' => 'monitor light bars and desk lighting',
            ],
            [
                'title' => 'Starter Kit Essentials for New Apartments',
                'category' => 'Home',
                'excerpt' => 'The first week checklist: must-haves without overbuying clutter.',
                'author' => 'PlayPulse Home',
                'focus' => 'home starter kits and apartment living',
            ],
            [
                'title' => 'Phone Tripod Angles for Better Content',
                'category' => 'Mobile',
                'excerpt' => 'Stable shots for Reels, tutorials, and product demos with a compact stand.',
                'author' => 'TrailCarry Creators',
                'focus' => 'phone tripods and mobile content creation',
            ],
            [
                'title' => 'Nonstick Pan Care That Actually Lasts',
                'category' => 'Kitchen',
                'excerpt' => 'Heat habits, utensils, and cleaning routines that protect coating longer.',
                'author' => 'HydroDay Kitchen',
                'focus' => 'cookware care and nonstick pans',
            ],
            [
                'title' => 'First Flights with a Mini Camera Drone',
                'category' => 'Gadgets',
                'excerpt' => 'Safety basics, framing tips, and battery planning for new drone pilots.',
                'author' => 'PulseTrack Aerial',
                'focus' => 'mini drones and aerial photography',
            ],
            [
                'title' => 'Office Lunch Ideas with an Insulated Tote',
                'category' => 'Lifestyle',
                'excerpt' => 'Keep meals fresh longer and build a rotation that survives busy days.',
                'author' => 'NovaKit Daily',
                'focus' => 'lunch totes and office meal habits',
            ],
            [
                'title' => 'Vertical Mouse Comfort for Long Workdays',
                'category' => 'Workspace',
                'excerpt' => 'Reduce wrist strain with grip setup, DPI settings, and desk posture.',
                'author' => 'BrightLoom Ergonomics',
                'focus' => 'ergonomic mice and desk posture',
            ],
            [
                'title' => 'Power Bank Buying Guide for Travel Days',
                'category' => 'Mobile',
                'excerpt' => 'Capacity, PD charging, airline rules, and what “fast enough” really means.',
                'author' => 'Auralis Mobile',
                'focus' => 'power banks and travel charging',
            ],
            [
                'title' => 'Smoothie Routines with a Glass Blender Jug',
                'category' => 'Kitchen',
                'excerpt' => 'Texture tricks, ingredient order, and easy cleanup for daily blends.',
                'author' => 'HomeForge Kitchen',
                'focus' => 'blenders and healthy morning routines',
            ],
            [
                'title' => 'Make VR Sessions More Comfortable',
                'category' => 'Gaming',
                'excerpt' => 'Strap fit, break cadence, and room setup for longer play without fatigue.',
                'author' => 'ChargeLab Labs',
                'focus' => 'VR headsets and comfort accessories',
            ],
            [
                'title' => 'Day Hiking with a 25L Pack',
                'category' => 'Travel',
                'excerpt' => 'Weight distribution, hydration, and packing cubes for trail-ready days.',
                'author' => 'VoltRide Outdoors',
                'focus' => 'daypacks and hiking essentials',
            ],
            [
                'title' => 'External SSD Tips for Creators',
                'category' => 'Computers',
                'excerpt' => 'Enclosure choice, cable quality, and backup habits that protect footage.',
                'author' => 'DeskForm Studio',
                'focus' => 'SSD enclosures and creator workflows',
            ],
            [
                'title' => 'Drip Coffee That Tastes Like a Café',
                'category' => 'Kitchen',
                'excerpt' => 'Grind size, water temperature, and ratio basics for consistent mornings.',
                'author' => 'HomeForge Kitchen',
                'focus' => 'coffee makers and home brewing',
            ],
            [
                'title' => 'City Commuting on an Electric Scooter',
                'category' => 'Mobility',
                'excerpt' => 'Safety gear, battery care, and route planning for everyday rides.',
                'author' => 'PulseTrack Mobility',
                'focus' => 'electric scooters and urban commuting',
            ],
            [
                'title' => 'Microphone Setup for Clear Remote Calls',
                'category' => 'Workspace',
                'excerpt' => 'Placement, gain, and room treatment that make your voice sound pro.',
                'author' => 'DeskForm Studio',
                'focus' => 'USB microphones and remote work audio',
            ],
            [
                'title' => 'Smart Shopping Habits for Better Deals',
                'category' => 'Shopping',
                'excerpt' => 'Compare value, timing, and trust signals before you tap “Add to cart”.',
                'author' => 'V2005 Editorial',
                'focus' => 'online shopping tips and deal evaluation',
            ],
        ];
    }

    /**
     * @param  array{title: string, category: string, excerpt: string, author: string, focus: string}  $topic
     */
    private function buildBody(array $topic, int $edition, int $index): string
    {
        $focus = $topic['focus'];

        $paragraphs = [
            "<p>At V2005, we see shoppers ask the same practical questions about {$focus}. This guide (#{$index}) keeps the advice clear, useful, and ready to apply on your next order.</p>",
            "<p><strong>Start with the job to be done.</strong> Decide what “good enough” means for your week: speed, comfort, durability, or value. That filter prevents overspending on features you will never use.</p>",
            "<p><strong>Check the everyday details.</strong> Look at materials, warranty language, stock signals, and real shipping expectations. Small product choices often matter more than marketing headlines.</p>",
            "<p><strong>Compare options side by side.</strong> Open two or three product pages, note price vs. compare-at savings, and scan reviews for consistency. A short shortlist beats endless scrolling.</p>",
            "<p><strong>Set up for success after checkout.</strong> Unbox carefully, keep packaging for returns if needed, and follow the first-week care tips tied to {$focus}. Good habits extend product life.</p>",
            "<p>Edition {$edition} of this series expands on seasonal use-cases and common mistakes we see in support chats. Bookmark it if you are upgrading gear this month.</p>",
            "<p>Ready to shop? Browse the matching collection on V2005, add your top pick to cart, and use wishlist for anything still under consideration.</p>",
        ];

        return implode("\n", $paragraphs);
    }
}
