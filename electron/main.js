import electron from 'electron';
const { app, BrowserWindow, ipcMain, systemPreferences } = electron;
import path from 'path';
import http from 'http';


const isDev = !app.isPackaged;
app.setName('Avatarian');

const STREAM_DECK_PORT = 8769;

function createWindow() {
    const win = new BrowserWindow({
        title: 'Avatarian',
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        transparent: true,
        frame: false,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Security best practice
            webSecurity: true // Local files won't be able to access local resources blindly if false
        },
        autoHideMenuBar: true, // Hide the default menu bar
        icon: path.join(import.meta.dirname, '../public/logo.png')
    });

    if (isDev) {
        // In development mode, point to the Vite dev server
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        // In production, point to the built index.html
        win.loadFile(path.join(import.meta.dirname, '../dist/index.html'));
    }

    return win;
}

// --- Stream Deck HTTP API ---
function startStreamDeckServer(win) {
    const server = http.createServer((req, res) => {
        // Only allow requests from localhost
        const remoteIp = req.socket.remoteAddress;
        if (remoteIp !== '127.0.0.1' && remoteIp !== '::1' && remoteIp !== '::ffff:127.0.0.1') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Forbidden' }));
            return;
        }

        const url = new URL(req.url, `http://localhost:${STREAM_DECK_PORT}`);
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');

        // GET /api/switch/:keybind — switch tab by keybind (1-8)
        const switchMatch = pathname.match(/^\/api\/switch\/([1-8])$/);
        if (switchMatch) {
            const keybind = switchMatch[1];
            win.webContents.send('switch-tab', { keybind });
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true, switched: keybind }));
            return;
        }

        // GET /api/tabs — list current tabs (forwarded from renderer)
        if (pathname === '/api/tabs') {
            win.webContents.send('get-tabs');

            const timeout = setTimeout(() => {
                ipcMain.removeAllListeners('get-tabs-reply');
                res.writeHead(504);
                res.end(JSON.stringify({ error: 'Timeout waiting for tab list' }));
            }, 2000);

            ipcMain.once('get-tabs-reply', (_event, tabs) => {
                clearTimeout(timeout);
                res.writeHead(200);
                res.end(JSON.stringify({ tabs }));
            });
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found', routes: ['GET /api/switch/:keybind (1-8)', 'GET /api/tabs'] }));
    });

    server.listen(STREAM_DECK_PORT, '127.0.0.1', () => {
        console.log(`Stream Deck API listening on http://127.0.0.1:${STREAM_DECK_PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Stream Deck API port ${STREAM_DECK_PORT} is already in use.`);
        } else {
            console.error('Stream Deck API server error:', err);
        }
    });

    return server;
}

app.whenReady().then(async () => {
    // Request microphone permission on macOS if needed
    if (process.platform === 'darwin') {
        try {
            await systemPreferences.askForMediaAccess('microphone');
        } catch (e) {
            console.log("Failed to ask for microphone access", e);
        }
    }

    const mainWindow = createWindow();

    // Start the Stream Deck HTTP API server
    startStreamDeckServer(mainWindow);

    ipcMain.on('window-control', (event, command) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return;
        if (command === 'minimize') win.minimize();
        if (command === 'maximize') {
            if (win.isMaximized()) win.unmaximize();
            else win.maximize();
        }
        if (command === 'close') win.close();
    });

    // Manual window drag for transparent frameless windows (workaround for Electron bug on Windows)
    let dragStartWinPos = null;
    ipcMain.on('window-drag-start', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) dragStartWinPos = win.getPosition();
    });
    ipcMain.on('window-dragging', (event, { deltaX, deltaY }) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win && dragStartWinPos) {
            win.setPosition(dragStartWinPos[0] + deltaX, dragStartWinPos[1] + deltaY);
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
