"use client";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import ImageLibrary from "./ImageLibrary";
import { LayoutRef, LayoutWithRef, Modal } from "../../ui/layout";
import { Button } from "../../ui/button";

const Context = createContext<{
  openLibrary(
    onSuccess: (selectedImgs: string[]) => void,
    isMulti: boolean,
  ): void;
} | null>(null);

export default function ImageLibraryModalProvider({
  children,
}: PropsWithChildren) {
  const modalref = useRef<LayoutRef>(null);

  const [selectedImgs, setSelectedImg] = useState<string[]>([]);

  const [isMulti, setIsMulti] = useState(false);

  const [onSuccess, setOnSuccess] = useState<(imgs: string[]) => void>(
    () => {},
  );

  const openModal = useCallback(
    (onSuccess: (selectedImgs: string[]) => void, isMulti: boolean) => {
      setOnSuccess(() => onSuccess);
      setIsMulti(isMulti);
      modalref.current?.open();
    },
    [],
  );

  const onCloseModal = useCallback(() => {
    setOnSuccess(() => {});
    setSelectedImg([]);
  }, []);

  const onToggleImg = useCallback(
    (url: string) => {
      if (isMulti) {
        setSelectedImg((p) =>
          p.includes(url) ? p.filter((item) => item !== url) : [...p, url],
        );
        return;
      }
      setSelectedImg((p) => (p.includes(url) ? [] : [url]));
    },
    [isMulti],
  );

  const onSubmit = useCallback(() => {
    onSuccess(selectedImgs);
    modalref.current?.close();
  }, [selectedImgs, onSuccess]);

  return (
    <Context.Provider
      value={{
        openLibrary: openModal,
      }}
    >
      {children}
      <LayoutWithRef ref={modalref} Component={Modal} afterClose={onCloseModal}>
        <div className="card bg-white w-xl">
          <div className="p-5">
            <ImageLibrary
              selectedImgs={selectedImgs}
              onClickImgBox={onToggleImg}
            />
            <div className="card-actions justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  modalref.current?.close();
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={onSubmit}
                color="success"
                disabled={selectedImgs.length === 0}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      </LayoutWithRef>
    </Context.Provider>
  );
}

export const useImgLibraryContext = () => {
  const context = useContext(Context);

  if (!context)
    throw new Error(
      "useImgLibraryContext must be wrapped in ImageLibraryModalProvider",
    );

  return context;
};
