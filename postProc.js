var cluster = require('cluster');
var process = require('process');
var fs = require('fs');
// rawFileContent = readFile('rawDataSet.txt', 'utf8')

wkPool = []
wk = 0
if (cluster.isMaster) {

    while (wk <= 36) {
        wkPool[wk] = cluster.fork();
        wk++
    }
    // console.log('aaa')


    wk = 0
    const readline = require('readline');
    const rl = readline.createInterface({
        input: fs.createReadStream('rawDataSet.txt'),
        crlfDelay: Infinity
    });
    lineNum = 0
    rl.on('line', (line) => {
        lineNum ++
        // console.log(line)
        wkPool[wk].send(line)
        wk++
        if (wk > 36) {
            wk = 0
        }
    });

    var logger = fs.createWriteStream('log.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
    })
    var writeLine = (line) => logger.write(`\n${line}`);
    // on worker process message, store the msg
    written = 0
    cluster.on('message', (worker, msg) => {
        writeLine(msg)
        written++
        console.log(`written: ${written} / ${lineNum}`)
        if (written == lineNum) {
            logger.end()
            console.log('done')
        }

    })

    
    

}
else {
    process.on('message', (msg) => {
        seq = msg.split('|')[0]
        score = msg.split('|')[1]
        // for every 3 letters in seq, add a space
        seq = seq.replace(/(.{3})/g, "$1 ")
        // post seq back to master
        process.send(`${seq} => ${score}`)
    })
}