"use client";

import DaumPostcode, { type Address } from "react-daum-postcode";

type Props = {
  onComplete: (address: string) => void;
  onClose: () => void;
};

export default function AddressSearchModal({ onComplete, onClose }: Props) {
  function handleComplete(data: Address) {
    onComplete(data.roadAddress || data.jibunAddress);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div className="bg-white w-full max-w-[500px] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-[14px] font-semibold text-black">주소 검색</span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-black text-lg leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <DaumPostcode onComplete={handleComplete} autoClose={false} />
      </div>
    </div>
  );
}
