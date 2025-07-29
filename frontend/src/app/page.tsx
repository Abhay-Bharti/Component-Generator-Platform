import Image from "next/image";

export default function Home() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>

      <iframe
        src="https://codesandbox.io/embed/new"
        style={{
          width: '100%',
          height: '500px',
          border: '0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
        title="CodeSandbox Embed"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      ></iframe>
    </div>
  );
}
