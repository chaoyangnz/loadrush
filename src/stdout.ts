/* tslint:disable */
import fs from 'fs';

export function hookStream(
  stream: NodeJS.WriteStream,
  callback: (string: any, encoding: any, fd: any) => void,
) {
  const oldWrite = stream.write;

  // @ts-ignore
  stream.write = ((write) => {
    return (string: any, encoding: any, fd: any) => {
      // @ts-ignore
      // write.apply(stream, arguments); // comments this line if you don't want output in the console
      callback(string, encoding, fd);
    };
  })(stream.write);

  return () => {
    stream.write = oldWrite;
  };
}

export function redirectStdout() {
  const logFile = fs.createWriteStream(__dirname + '/loadflux.log', {
    flags: 'w',
  });
  hookStream(process.stdout, (str: any, encoding: any, fd: any) => {
    logFile.write(str, encoding);
  });
}
