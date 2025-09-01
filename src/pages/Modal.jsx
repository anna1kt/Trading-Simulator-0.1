import React, { useEffect, useState } from "react";

export default function Modal(props) {
  const {
    message,
    onClose,
    title,
    children,
    onOk,
    onCancel,
    okText = "OK",
    cancelText,
  } = props;

  const isSimple = !!message && !children;
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isSimple) return;
    const tFade = setTimeout(() => setClosing(true), 4000);
    const tClose = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);
    return () => {
      clearTimeout(tFade);
      clearTimeout(tClose);
    };
  }, [isSimple, onClose]);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => { if (onClose) onClose(); }, 350);
  };

  const handleOk = () => {
    if (onOk) onOk();
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    handleClose();
  };

  return (
    <div className="modal-backdrop-custom" onClick={handleClose}>
      <div
        className={`modal-window ${closing ? 'modal-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isSimple ? (
          <div className="modal-success">
            <div className="check-wrap" aria-hidden>
              <svg className="check-icon" viewBox="0 0 24 24" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="url(#g1)"/>
                <path d="M7.5 12.5l2.5 2.5L16.5 9" stroke="#062018" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0" stopColor="var(--ok)"/>
                    <stop offset="1" stopColor="#35d8a5"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h3 className="modal-title">Success</h3>
            <div className="modal-body-text">{message}</div>

            <div className="modal-footer">
              <button className="modal-btn ok" onClick={handleClose}>OK</button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h5 className="modal-title">{title ?? "Notice"}</h5>
              <button className="btn btn-ghost" onClick={handleClose}>✕</button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              {cancelText && <button className="btn btn-ghost" onClick={handleCancel}>{cancelText}</button>}
              <button className="btn btn-primary" onClick={handleOk}>{okText}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

   
