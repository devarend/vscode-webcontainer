import 'xterm/css/xterm.css';
import {useEffect, useRef, useState} from 'react'
import {WebContainer} from "@webcontainer/api";
import { Terminal } from 'xterm'
import {workspace, FileType, Uri} from 'vscode';

const getWebContainerFiles = async () => {
    const folder = workspace.workspaceFolders?.[0]
    if (!folder) return

    const transformToWebcontainerFiles = async (dir: Uri, files: any = {}) => {
        for (const [name, type] of await workspace.fs.readDirectory(dir)) {
            if (type === FileType.File) {
                const filePath = Uri.joinPath(dir, name)
                const readData = await workspace.fs.readFile(filePath);
                const value = new TextDecoder().decode(readData);
                files[name] = {
                    file: {
                        contents: value,
                    },
                };
            }
            if (type === FileType.Directory) {
                files[name] = {
                    directory: {},
                };
                await transformToWebcontainerFiles(Uri.joinPath(dir, name), files[name].directory);
            }
        }
        return files
    }
    return await transformToWebcontainerFiles(folder.uri)
}

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
            const files = getWebContainerFiles()
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
