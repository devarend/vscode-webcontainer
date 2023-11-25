import {useEffect, useRef, useState} from 'react'
import './App.css'
import {WebContainer} from "@webcontainer/api";
import {files} from "./files";

function App() {
    const webcontainerInstance = useRef<any>();
    const [isInitializing, setIsInitializing] = useState(true);
    const [url, setUrl] = useState("");
    const [code, setCode] = useState(
        files['index.js'].file.contents
    );
    const iframeRef = useRef<any>(null);

    const setCodeChange = async (item) => {
        setCode(item.target.value);
        webcontainerInstance.current.fs.writeFile("/index.js", item.target.value);
    };

    const installDependencies = async () => {
        const installProcess = await webcontainerInstance.current.spawn("npm", [
            "install",
        ]);
        installProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    console.log(data);
                },
            })
        );
        return installProcess.exit;
    };

    const startDevServer = async () => {
        await webcontainerInstance.current.spawn("npm", ["run", "start"]);
        webcontainerInstance.current.on("server-ready", (port, url) => {
            setUrl(url);
            iframeRef.current.src = url;
            setIsInitializing(false);
        });
    };

    useEffect(() => {
        (async () => {
            webcontainerInstance.current = await WebContainer.boot();
            await webcontainerInstance.current.mount(files);

            const exitCode = await installDependencies();
            if (exitCode !== 0) {
                throw new Error("Installation failed");
            }

            startDevServer();
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
                    <textarea      value={code}
                                   onChange={setCodeChange}/>
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
