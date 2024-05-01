import React from "react";
import {
  AriaModalOverlayProps,
  ModalAria,
  Overlay,
  useModalOverlay,
  useOverlayTrigger,
} from "react-aria";
import { OverlayTriggerState, useOverlayTriggerState } from "react-stately";
import Button from "./Button";

type ModalProps = {
  state: OverlayTriggerState;
  children: React.ReactNode;
} & AriaModalOverlayProps;

function Modal({ state, children, ...props }: ModalProps) {
  let ref = React.useRef(null);
  let { modalProps, underlayProps } = useModalOverlay(props, state, ref);

  return (
    <Overlay>
      <div
        className="fixed z-100 top-0 left-0 bottom-0 right-0 bg-black/50 flex items-center justify-center"
        {...underlayProps}
      >
        <div
          {...modalProps}
          ref={ref}
          className="bg-white rounded-md border border-gray-300 shadow-md max-w-2xl"
        >
          {children}
        </div>
      </div>
    </Overlay>
  );
}

type ModalTriggerProps = {
  label: string;
  children(close: () => void): React.ReactElement;
  className?: string;
};

export function ModalTrigger({
  label,
  children,
  className,
  ...props
}: ModalTriggerProps) {
  let state = useOverlayTriggerState(props);
  let { triggerProps, overlayProps } = useOverlayTrigger(
    { type: "dialog" },
    state
  );

  return (
    <>
      <Button {...triggerProps} className={className}>
        {label}
      </Button>
      {state.isOpen && (
        <Modal state={state}>
          {React.cloneElement(children(state.close), overlayProps)}
        </Modal>
      )}
    </>
  );
}
