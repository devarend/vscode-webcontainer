// import 'xterm/css/xterm.css';
// import {useEffect, useRef, useState} from 'react'
// import {WebContainer} from "@webcontainer/api";
// import {Terminal} from 'xterm'
// import {FitAddon} from 'xterm-addon-fit';
// import {files} from "./files";
//
// interface VsCodeApi {
//     postMessage(message: any): void;
//
//     setState(state: any): void;
//
//     getState(): any;
// }
//
// declare const acquireVsCodeApi: () => VsCodeApi;
//
// function App() {
//     const webcontainerInstance = useRef<any>();
//     const [value, setValue] = useState("");
//     const iframeRef = useRef<any>(null);
//
//     useEffect(() => {
//
//         window.addEventListener('message', event => {
//             const message = event.data;
//             switch (message.command) {
//                 case 'updateFile':
//                     console.log(webcontainerInstance.current)
//                     // webcontainerInstance.current.fs.writeFile(message.path, message.value)
//                     // webcontainerInstance.current.fs.writeFile('/pages/_app.page.tsx', '')
//                     // webcontainerInstance.current.fs.writeFile('/pages/_app.page.tsx', event.target.value)
//                     break;
//                 case 'loadFiles':
//                     (async () => {
//                         console.log('test')
//                         // const vscode = acquireVsCodeApi();
//                         const terminalEl = document.querySelector('.terminal');
//                         const terminal = new Terminal({
//                             convertEol: true,
//                         });
//                         const fitAddon = new FitAddon();
//                         terminal.loadAddon(fitAddon);
//                         terminal.open(terminalEl as HTMLElement);
//                         fitAddon.fit();
//                         webcontainerInstance.current = await WebContainer.boot();
//                         const bootFiles = message.files
//                         await webcontainerInstance.current.mount(bootFiles);
//                         const iframeEl = document.querySelector('iframe');
//                         setValue(message.files.ui.directory.src.directory.pages.directory['_app.page.tsx'].file.contents)
//
//                         webcontainerInstance.current.on("server-ready", (port, url) => {
//                             // vscode.postMessage({command: 'preview', text: url})
//                             // setUrl(url);
//                             iframeEl.src = url;
//                         });
//
//                         const shellProcess = await webcontainerInstance.current.spawn('jsh');
//
//                         const xtermResizeOb = new ResizeObserver(function (entries) {
//                             fitAddon.fit();
//                             shellProcess.resize({
//                                 cols: terminal.cols,
//                                 rows: terminal.rows,
//                             });
//                         });
//
//                         xtermResizeOb.observe(terminalEl);
//
//                         shellProcess.output.pipeTo(
//                             new WritableStream({
//                                 write(data) {
//                                     terminal.write(data);
//                                 },
//                             })
//                         );
//
//                         const input = shellProcess.input.getWriter();
//                         terminal.onData((data) => {
//                             input.write(data);
//                         });
//                     })();
//                     break;
//             }
//         });
//     }, []);
//
//
//     const onChange = (event) => {
//         setValue(event.target.value)
//         webcontainerInstance.current.fs.writeFile('/ui/src/pages/_app.page.tsx', event.target.value)
//     }
//
//
//     return (
//         <>
//             <div className="flex h-screen">
//                 <div className="terminal h-96 w-96"/>
//                 <textarea value={value} onChange={onChange}/>
//                 <iframe style={{height: 500, width: 500}} allow="cross-origin-isolated"></iframe>
//             </div>
//         </>
//     );
// }
//
// export default App

import 'xterm/css/xterm.css';
import {useEffect, useRef, useState} from 'react'
import {WebContainer} from "@webcontainer/api";
import {Terminal} from 'xterm'
import {FitAddon} from 'xterm-addon-fit';
import {files} from "./files";

interface VsCodeApi {
    postMessage(message: any): void;

    setState(state: any): void;

    getState(): any;
}

declare const acquireVsCodeApi: () => VsCodeApi;

function App() {
    const webcontainerInstance = useRef<any>();
    const [value, setValue] = useState("");
    const iframeRef = useRef<any>(null);

    useEffect(() => {

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateFile':
                    break;
                case 'loadFiles':
                    (async () => {
                        // const vscode = acquireVsCodeApi();
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
                        const iframeEl = document.querySelector('iframe');

                        webcontainerInstance.current.on("server-ready", (port, url) => {
                            // vscode.postMessage({command: 'preview', text: url})
                            // setUrl(url);
                            iframeEl.src = url;
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

                        setValue(message.files.ui.directory.src.directory.pages.directory['_app.page.tsx'].file.contents)

                        const input = shellProcess.input.getWriter();
                        terminal.onData((data) => {
                            input.write(data);
                        });
                    })();
                    break;
            }
        });
    }, []);


    const onChange = (event) => {
        setValue(event.target.value)
        webcontainerInstance.current.fs.writeFile('ui/src/pages/_app.page.tsx', event.target.value)
    }

    const onClick = () => {
        window.postMessage({command: 'loadFiles', files}, '*')
    }

    return (
        <>
            <div className="flex h-screen">
                <div className="terminal h-96 w-96"/>
                <button className="bg-black h-12 w-12" onClick={onClick}>load</button>
                <textarea value={value} onChange={onChange}/>
                <iframe style={{height: 500, width: 500}} allow="cross-origin-isolated"></iframe>
            </div>
        </>
    );
}

export default App
