import { useRef, type HTMLProps, type JSX } from "react";
import "./Modal.css";
import { ModalContext } from "./modalContext";

export function Modal({
  children,
  trigger: Trigger,
  ...rest
}: {
  trigger: (props: { open: () => void }) => JSX.Element;
} & HTMLProps<HTMLDialogElement>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contextValue = {
    getRef: () => dialogRef.current,
  };

  const onOpen = () => {
    dialogRef.current?.showModal();
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <Trigger open={onOpen} />
      <dialog
        closedby="any"
        {...rest}
        className={`modal ${rest.className ?? ""}`}
        ref={dialogRef}
      >
        {children}
      </dialog>
    </ModalContext.Provider>
  );
}
