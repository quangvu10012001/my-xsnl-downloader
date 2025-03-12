import { useState } from 'react';
import { Button, Input, List, message, Card, Modal, Progress } from 'antd';
import { DownloadOutlined, LinkOutlined } from '@ant-design/icons';

declare global {
  interface Window {
    electron: {
      fetchFiles: (url: string) => Promise<string[]>;
      downloadFiles: (files: string[]) => Promise<void>;
      onDownloadProgress: (callback: (progress: number) => void) => void;
    };
  }
}

export default function App() {
  const [url, setUrl] = useState<string>('');
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const fetchFiles = async () => {
    if (!url) return message.error('Vui lòng nhập URL');
    setLoading(true);
    try {
      const result: string[] = await window.electron.fetchFiles(url);
      setFiles(result);
      message.success(`Tìm thấy ${result.length} file .xsnl`);
    } catch (error) {
      message.error('Lỗi khi duyệt trang');
    }
    setLoading(false);
  };

  const downloadFiles = async () => {
    if (!files.length) return message.warning('Không có file nào để tải');
    setLoading(true);
    setModalVisible(true);

    try {
      let downloaded = 0;
      window.electron.onDownloadProgress((progress) => {
        setProgress(progress);
      });

      await window.electron.downloadFiles(files);
      message.success('Tải xuống hoàn tất');
    } catch (error) {
      message.error('Lỗi khi tải file');
    }

    setLoading(false);
    setModalVisible(false);
  };

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-gradient-to-r from-blue-400 to-blue-700 text-white">
      <Card className="w-full max-w-3xl p-5 bg-white shadow-xl rounded-2xl">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          XSNl Downloader
        </h1>
        <Input
          prefix={<LinkOutlined />}
          className="mb-4"
          placeholder="Nhập URL trang web"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          type="primary"
          className="w-full mb-2"
          icon={<LinkOutlined />}
          loading={loading}
          onClick={fetchFiles}
        >
          Duyệt trang
        </Button>
        <List
          bordered
          dataSource={files}
          renderItem={(file) => <List.Item>{file}</List.Item>}
          className="mb-4"
        />
        <Button
          type="primary"
          className="w-full"
          icon={<DownloadOutlined />}
          loading={loading}
          onClick={downloadFiles}
        >
          Tải tất cả
        </Button>
      </Card>

      <Modal
        title="Đang tải xuống..."
        open={modalVisible}
        footer={null}
        closable={false}
      >
        <Progress percent={progress} />
      </Modal>
    </div>
  );
}
