import 'xterm/css/xterm.css';
import {useEffect, useRef, useState} from 'react'
import {WebContainer} from "@webcontainer/api";
import {files} from "./files";
import { Terminal } from 'xterm'

function App() {
    const webcontainerInstance = useRef<any>();
    const [isInitializing, setIsInitializing] = useState(true);
    const [url, setUrl] = useState("");
    const iframeRef = useRef<any>(null);

    const startShell = async terminal => {
        const shellProcess = await webcontainerInstance.current.spawn('jsh');
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

        return shellProcess;
    };

    useEffect(() => {
        (async () => {
            const terminalEl = document.querySelector('.terminal');
            const terminal = new Terminal({
                convertEol: true,
            });
            terminal.open(terminalEl as HTMLElement);
            webcontainerInstance.current = await WebContainer.boot();
            await webcontainerInstance.current.mount(files);

            webcontainerInstance.current.on("server-ready", (port, url) => {
                setUrl(url);
                iframeRef.current.src = url;
                setIsInitializing(false);
            });
            await startShell(terminal);
        })();
    }, []);

    const iframeStyle = isInitializing
        ? {
            backgroundImage: "url('http://localhost:3000/loader.gif')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "fit",
            backgroundPosition: "center center",
        }
        : {};


    return (
        <>
            <div className="flex">
                <div className="terminal"/>
                <div className="flex-1 ml-2">
                    <h1>{isInitializing ? "Initializing zkApp..." : `${url}`}</h1>
                    <iframe
                        ref={iframeRef}
                        className="h-full border-2 border-black"
                        style={iframeStyle}
                        allow="cross-origin-isolated"
                    />
                </div>
            </div>
        </>
    );
}

export default App
