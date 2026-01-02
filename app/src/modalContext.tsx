import { createContext } from "react";

export const ModalContext = createContext<{
  getRef: () => HTMLDialogElement | null;
}>({ getRef: () => null });
