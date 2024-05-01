import React from "react";
import { AriaButtonProps, useButton } from "react-aria";
import { RefObject, useRef } from "react";
import { mergeRefs } from "@react-aria/utils";

export type ButtonProps = {
  className?: string;
} & AriaButtonProps;

const Button = React.forwardRef(function Button(
  props: ButtonProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);
  const { children } = props;

  return (
    <button
      {...buttonProps}
      className={props.className}
      ref={mergeRefs(ref, forwardedRef)}
    >
      {children}
    </button>
  );
});

export default Button;
