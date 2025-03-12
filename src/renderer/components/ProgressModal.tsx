import { Modal, Progress } from 'antd';
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

interface ProgressModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProgressModal({
  visible,
  onClose,
}: ProgressModalProps) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    ipcRenderer.on('download-progress', (_event, value: number) => {
      setProgress(value);
    });

    return () => {
      ipcRenderer.removeAllListeners('download-progress');
    };
  }, []);

  return (
    <Modal
      title="Đang tải file..."
      open={visible}
      footer={null}
      onCancel={onClose}
    >
      <Progress percent={Math.round(progress)} status="active" />
    </Modal>
  );
}
