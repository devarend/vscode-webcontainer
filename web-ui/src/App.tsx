import {useEffect} from 'react'
import './App.css'
import {WebContainer} from "@webcontainer/api";

export const files = {
    'index.js': {
        file: {
            contents: `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});`,
        },
    },
    'package.json': {
        file: {
            contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`,
        },
    },
};

function App() {
    const setup = async () => {
        console.log('setup')
        const webcontainer = await WebContainer.boot({
            workdirName: "terminal",
        });
        await webcontainer.mount(files);

        const installProcess = await webcontainer.spawn("npm", ["install"]);
        installProcess.output.pipeTo(new WritableStream({
            write(data) {
                console.log(data);
            }
        }))
        if ((await installProcess.exit) !== 0) {
            throw new Error("Installation failed");
        }
    }
    useEffect(() => {
        setup()
    }, [])

    return (
        <div className="container">
            <div className="editor">
                <textarea>I am a textarea</textarea>
            </div>
        </div>
    )
}

export default App
