import 'xterm/css/xterm.css';
import {useEffect, useRef, useState} from 'react'
import {WebContainer} from "@webcontainer/api";
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit';

//Insert this into your App.tsx file after the imports.
interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

function App() {
    const webcontainerInstance = useRef<any>();
    const [isInitializing, setIsInitializing] = useState(true);
    const [url, setUrl] = useState("");
    const iframeRef = useRef<any>(null);

    useEffect(() => {
        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.command) {
                case 'refactor':
                    (async () => {
                        const terminalEl = document.querySelector('.terminal');
                        const terminal = new Terminal({
                            convertEol: true,
                        });
                        const fitAddon = new FitAddon();
                        terminal.loadAddon(fitAddon);
                        terminal.open(terminalEl as HTMLElement);
                        fitAddon.fit();
                        webcontainerInstance.current = await WebContainer.boot();
                        const bootFiles = message.files
                        await webcontainerInstance.current.mount(bootFiles);

                        webcontainerInstance.current.on("server-ready", (port, url) => {
                            setUrl(url);
                            iframeRef.current.src = url;
                            setIsInitializing(false);
                        });

                        const shellProcess = await webcontainerInstance.current.spawn('jsh');

                        const xtermResizeOb = new ResizeObserver(function (entries) {
                            fitAddon.fit();
                            shellProcess.resize({
                                cols: terminal.cols,
                                rows: terminal.rows,
                            });
                        });

                        xtermResizeOb.observe(terminalEl);

                        shellProcess.output.pipeTo(
                            new WritableStream({
                                write(data) {
                                    terminal.write(data);
                                },
                            })
                        );

                        const input = shellProcess.input.getWriter();
                        terminal.onData((data) => {
                            input.write(data);
                        });
                    })();
                    break;
            }
        });
    }, []);


    return (
        <>
            <div className="flex h-screen bg-black">
                <div className="terminal h-full w-full"/>
            </div>
        </>
    );
}

export default App
