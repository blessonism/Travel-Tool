"use client";

import React from "react";
import type { AriaDialogProps } from "react-aria";
import { useDialog } from "react-aria";

interface DialogProps extends AriaDialogProps {
  title?: React.ReactNode;
  children: React.ReactNode;
}

export default function Dialog({ title, children, ...props }: DialogProps) {
  let ref = React.useRef(null);
  let { dialogProps, titleProps } = useDialog(props, ref);

  return (
    <div {...dialogProps} ref={ref} className="outline-none">
      {title && (
        <h3 {...titleProps} className="mt-0 text-2xl font-bold">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
