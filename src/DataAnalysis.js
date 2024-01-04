import React, { useState, useEffect } from 'react';
import './App.css';

function DataAnalysis() {
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedColumns, setSelectedColumns] = useState(new Set());
  const [filterConditions, setFilterConditions] = useState({});

  useEffect(() => {
    if (data.length > 0) {

      const allColumns = new Set(Object.keys(data[0]));
      setSelectedColumns(allColumns);
    }
  }, [data]);

  const handleFilterChange = (header, value) => {
    setFilterConditions(prevConditions => ({
      ...prevConditions,
      [header]: value
    }));
  };

  const handleRowSelect = (index) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleColumnSelect = (columnName) => {
    const newSelectedColumns = new Set(selectedColumns);
    if (newSelectedColumns.has(columnName)) {
      newSelectedColumns.delete(columnName);
    } else {
      newSelectedColumns.add(columnName);
    }
    setSelectedColumns(newSelectedColumns);
  };
  const handleProcessDataForWord = async () => {
    const selectedData = getSelectedData();
    try {
      const url = `/generate-word`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedData),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ExportedData.docx';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error generating document');
      }
    } catch (error) {
      console.error('Error during processing:', error);
    }
  };
  const getSelectedData = () => {
    const selectedData = [];
    data.forEach((row, index) => {
      if (selectedRows.has(index)) {
        const rowData = {};
        Object.keys(row).forEach(header => {
          if (selectedColumns.has(header)) {
            rowData[header] = row[header];
          }
        });
        selectedData.push(rowData);
      }
    });
    console.log(selectedData); // 可以在这里查看或处理被选中的数据
    return selectedData; // 返回被选中的数据
  };

  const handleDownloadCsv = async () => {
    console.log('Downloading CSV from URL:', googleSheetUrl);
    const backendUrl = `/download-sheet?sheetUrl=${encodeURIComponent(googleSheetUrl)}`;
    console.log('Backend URL:', backendUrl);
    try {
      const response = await fetch(backendUrl);
      if (response.ok) {
        const jsonData = await response.json(); // 直接解析JSON数据
        setData(jsonData);
        alert('下载完成');
      } else {
        alert('下载错误');
        console.error('Error response:', response);
      }
    } catch (error) {
      console.error('Error during download:', error);
      alert('下载时发生错误');
    }
  };

  const renderTable = () => {
    if (data.length === 0) return null;

    const headers = Object.keys(data[0]);

    // 根据筛选条件过滤数据
    const filteredData = data.filter(row => {
      return headers.every(header => {
        return !filterConditions[header] || row[header] === filterConditions[header];
      });
    });

    return (
      <table>
        <thead>
          <tr>
            <th></th>
            {headers.map((header) => (
              <th key={header}>
                {header}
                <input
                  type="checkbox"
                  checked={selectedColumns.has(header)}
                  onChange={() => handleColumnSelect(header)}
                />
                {/* 下拉式菜单，用于筛选 */}
                <select onChange={(e) => handleFilterChange(header, e.target.value)}>
                  <option value="">All</option>
                  {[...new Set(data.map(row => row[header]))].map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.has(index)}
                  onChange={() => handleRowSelect(index)}
                />
              </td>
              {headers.map((header) => (
                <td key={header}>
                    {selectedColumns.has(header) ? row[header] : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <input
        type="text"
        className="input"
        value={googleSheetUrl}
        onChange={(e) => setGoogleSheetUrl(e.target.value)}
        placeholder="输入Google工作表URL"
      />
      <button className="app-button" onClick={handleDownloadCsv}>獲取工作表</button>
      <button className="app-button" onClick={handleProcessDataForWord}>匯出體檢表資料</button>
      {renderTable()}
    </div>
  );
}

export default DataAnalysis