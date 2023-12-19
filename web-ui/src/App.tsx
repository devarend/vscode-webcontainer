import 'xterm/css/xterm.css';
import {useEffect, useRef, useState} from 'react'
import {WebContainer} from "@webcontainer/api";
import {Terminal} from 'xterm'
import {FitAddon} from 'xterm-addon-fit';

interface VsCodeApi {
    postMessage(message: any): void;

    setState(state: any): void;

    getState(): any;
}

declare const acquireVsCodeApi: () => VsCodeApi;

function App() {
    const webcontainerInstance = useRef<any>();
    const [url, setUrl] = useState("");
    const iframeRef = useRef<any>(null);

    useEffect(() => {
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateFile':
                    webcontainerInstance.current.fs.writeFile(message.path, message.value)
                    break;
                case 'loadFiles':
                    (async () => {
                        const vscode = acquireVsCodeApi();
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
                            vscode.postMessage({command: 'preview', text: url})
                            // setUrl(url);
                            // iframeRef.current.src = url;
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
