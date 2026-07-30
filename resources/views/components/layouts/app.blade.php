<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FeridhooTours — Premium Maldives Inter-Island Ferry & Speedboat Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
                            850: '#151f32',
                            950: '#020617',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; }
        .glass-panel { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .glass-panel-strong { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(51, 65, 85, 0.8); box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5); }
        .text-gradient { background: linear-gradient(90deg, #0284c7, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-text { background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    @livewireStyles
</head>
<body class="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-white">

    <livewire:navigation />

    <main class="flex-1 max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 w-full">
        {{ $slot }}
    </main>

    <footer class="border-t border-slate-800 bg-slate-900/60 py-10 mt-20 text-center text-xs text-slate-400">
        <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-bold text-slate-300">FeridhooTours Platform</span> · Neon PostgreSQL + Render.com
            </div>
            <p>© 2026 FeridhooTours Maldives. All Rights Reserved.</p>
        </div>
    </footer>

    @livewireScripts
</body>
</html>
