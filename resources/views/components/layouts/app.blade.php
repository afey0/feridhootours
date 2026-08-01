<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FeridhooTours — Premium Maldives Inter-Island Ferry & Speedboat Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    },
                    colors: {
                        slate: {
                            550: '#52637a',
                            850: '#151f32',
                            950: '#020617',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; }
        .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(226, 232, 240, 0.8); }
        .glass-panel-strong { background: #ffffff; backdrop-filter: blur(20px); border: 1px solid rgba(203, 213, 225, 0.8); box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08); }
        .text-gradient { background: linear-gradient(90deg, #0284c7, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-text { background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    @livewireStyles
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">

    <div class="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 min-h-screen flex flex-col w-full">
        <livewire:navigation />

        <main class="flex-1">
            {{ $slot }}
        </main>
    </div>

    @livewireScripts
</body>
</html>
