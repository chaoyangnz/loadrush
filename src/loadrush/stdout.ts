import fs from 'fs';

function hookStream(
  stream: NodeJS.WriteStream,
  callback: (str: any, encoding: any, fd: any) => void,
) {
  const oldWrite = stream.write;

  // @ts-ignore
  stream.write = ((write) => {
    return (str: any, encoding: any, fd: any) => {
      // write.apply(stream, arguments); // comments this line if you don't want output in the console
      callback(str, encoding, fd);
    };
  })(stream.write);

  return () => {
    stream.write = oldWrite;
  };
}

export function redirectStdout() {
  const logFile = fs.createWriteStream('loadrush.log', {
    flags: 'w',
  });
  hookStream(process.stdout, (str: any, encoding: any, fd: any) => {
    logFile.write(str, encoding);
  });
}
