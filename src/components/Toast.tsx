"use client";

import {
  useToast,
  type AriaToastProps,
  useToastRegion,
  type AriaToastRegionProps,
} from "@react-aria/toast";
import {
  useToastState,
  type ToastState,
  ToastQueue,
  useToastQueue,
} from "@react-stately/toast";
import Button from "./Button";
import React from "react";
import ReactDOM from "react-dom";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export const toasts = new ToastQueue<React.ReactNode>({
  maxVisibleToasts: 5,
});

export default function GlobalToastRegion() {
  let state = useToastQueue<React.ReactNode>(toasts);

  return state.visibleToasts.length > 0
    ? ReactDOM.createPortal(<ToastRegion state={state} />, document.body)
    : null;
}

type ToastProps<T> = AriaToastProps<T> & {
  state: ToastState<T>;
};

function Toast<T extends React.ReactNode>({ state, ...props }: ToastProps<T>) {
  let ref = React.useRef(null);
  let { toastProps, titleProps, closeButtonProps } = useToast(props, state, ref);
  const [isLeaving, setIsLeaving] = React.useState(false);

  // 组件挂载时启动定时器
  React.useEffect(() => {
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, 1500);

    const closeTimer = setTimeout(() => {
      state.close(props.toast.key);
    }, 2000);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [props.toast.key, state]);

  return (
    <div
      {...toastProps}
      ref={ref}
      className={cn(
        "flex justify-between items-start gap-2 p-4 rounded border shadow-sm bg-white",
        "transition-all duration-500 ease-in-out transform",
        {
          "opacity-0 translate-x-full": isLeaving,
          "opacity-100 translate-x-0": !isLeaving
        }
      )}
    >
      <div {...titleProps}>{props.toast.content}</div>
      <Button {...closeButtonProps}>
        <XMarkIcon className="h-5 w-5 text-gray-400" />
      </Button>
    </div>
  );
}

type ToastRegionProps<T> = AriaToastRegionProps & {
  state: ToastState<T>;
};

function ToastRegion<T extends React.ReactNode>({
  state,
  ...props
}: ToastRegionProps<T>) {
  let ref = React.useRef(null);
  let { regionProps } = useToastRegion(props, state, ref);

  return (
    <div
      {...regionProps}
      ref={ref}
      className="fixed bottom-2 right-2 left-2 sm:left-auto sm:bottom-4 sm:right-4 flex flex-col gap-2 w-96"
    >
      {state.visibleToasts.map((toast) => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
}
