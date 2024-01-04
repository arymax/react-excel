  const Docxtemplater = require('docxtemplater');
  const PizZip = require('pizzip');
  const express = require('express');
  const fs = require('fs');
  const path = require('path');
  const https = require('https');
  const cors = require('cors');
  const Papa = require('papaparse');
  const app = express();
  const port = 3001;

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'build')));
  function extractSheetDetails(url) {
    const sheetIdMatch = /\/d\/(.+?)\//.exec(url);
    const gidMatch = /gid=(\d+)/.exec(url);
    return {
      sheetId: sheetIdMatch ? sheetIdMatch[1] : null,
      gid: gidMatch ? gidMatch[1] : null
    };
  }
  function downloadFile(downloadUrl, filePath, res) {
    let csvData = ''; // 用于存储CSV数据的字符串

    const request = https.get(downloadUrl, (response) => {
      console.log(`响应状态码: ${response.statusCode}`);

      if (response.statusCode === 307 || response.statusCode === 302) {
        // 处理重定向
        const newUrl = response.headers.location;
        return downloadFile(newUrl, filePath, res);
      } else if (response.statusCode !== 200) {
        res.status(500).send('下载Google工作表时出错');
        return;
      }

      response.on('data', (chunk) => {
        csvData += chunk; // 将响应数据块添加到csvData
      });

      response.on('end', () => {
        // 使用Papa Parse解析csvData
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            fs.writeFile(filePath, csvData, (err) => {
              if (err) {
                console.error('文件写入错误:', err);
                res.status(500).send('文件写入错误');
                return;
              }
              // 发送解析后的数据回前端
              res.json(results.data);
            });
          }
        });
      });
    });

    request.on('error', (err) => {
      console.error('请求错误:', err);
      fs.unlink(filePath, () => {}); // 删除未完成的文件
      res.status(500).send('下载Google工作表时出错');
    });
  }

  app.get('/download-sheet', (req, res) => {
    const { sheetUrl } = req.query;
    const { sheetId, gid } = extractSheetDetails(sheetUrl);
    if (!sheetId || !gid) {
      return res.status(400).send('无效的Google Sheets URL');
    }

    const downloadUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    console.log(`Downloading Google Sheet: ${downloadUrl}`);
    const filePath = path.join(__dirname, 'downloads', `${sheetId}-${gid}.csv`);

    downloadFile(downloadUrl, filePath, res);
  });
app.post('/generate-word', async (req, res) => {
  try {
    const data = req.body;

    // 加載模板文件
    const templatePath = path.join(__dirname, 'template.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    // 將文檔生成為一個Promise數組
    const documentPromises = data.map(row => {
      return new Promise((resolve, reject) => {
        try {
          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          // 設置模板變量數據
          doc.setData(row);

          // 渲染文檔
          doc.render();

          // 解析文檔為Node Buffer
          const buffer = doc.getZip().generate({ type: 'nodebuffer' });
          resolve({
            buffer: buffer,
            name: row['外勞姓名'] // 確保這是你數據中的一個字段
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    // 等待所有文檔都生成完畢
    const documents = await Promise.all(documentPromises);

    // 如果只有一個文檔，直接發送
    if (documents.length === 1) {
      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(documents[0].name)}.docx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      return res.end(documents[0].buffer);
    } else {
      // 多個文檔時的處理
      const zip = new PizZip();
      documents.forEach(doc => {
        zip.file(`${doc.name}.docx`, doc.buffer);
      });
      const zipBuffer = zip.generate({ type: 'nodebuffer' });

      // 確保設置正確的響應頭
      res.writeHead(200, {
        'Content-Disposition': 'attachment; filename="ExportedData.zip"',
        'Content-Type': 'application/zip',
      });
      return res.end(zipBuffer);
    }
  } catch (err) {
    console.error('Error processing template', err);
    if (!res.headersSent) {
      res.status(500).send('Error processing template');
    }
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
  app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${port}`);
  });
