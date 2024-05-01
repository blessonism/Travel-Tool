"use client";

import type { MenuTriggerProps, Node, TreeState } from "react-stately";
import { AriaMenuProps, useMenu, useMenuTrigger } from "react-aria";
import { useMenuTriggerState, useTreeState } from "react-stately";
import Popover from "./Popover";
import Button, { ButtonProps } from "./Button";
import React from "react";
import { useMenuItem } from "react-aria";
import cn from "classnames";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type MenuButtonProps<T> = AriaMenuProps<T> &
  MenuTriggerProps &
  ButtonProps & {
    label?: React.ReactNode;
    icon?: React.ReactNode;
  };

export default function MenuButton<T extends object>(
  props: MenuButtonProps<T>
) {
  const state = useMenuTriggerState(props);

  const ref = React.useRef(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger<T>({}, state, ref);

  return (
    <>
      <Button {...menuTriggerProps} ref={ref} className={props.className}>
        {props.label}
        <span aria-hidden="true">
          {props.icon ? props.icon : <ChevronDownIcon className="w-5 h-5" />}
        </span>
      </Button>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="bottom start">
          <Menu {...props} {...menuProps} />
        </Popover>
      )}
    </>
  );
}

type MenuItemProps = {
  item: Node<object>;
  state: TreeState<object>;
};

function MenuItem({ item, state }: MenuItemProps) {
  const ref = React.useRef(null);
  const { menuItemProps, isFocused, isSelected, isDisabled } = useMenuItem(
    { key: item.key },
    state,
    ref
  );

  return (
    <li
      {...menuItemProps}
      ref={ref}
      className={cn(
        "flex justify-between cursor-default outline-none px-4 py-2 w-full",
        { "bg-gray-100": isFocused }
      )}
    >
      {item.rendered}
    </li>
  );
}

function Menu<T extends object>(props: AriaMenuProps<T>) {
  const state = useTreeState(props);

  const ref = React.useRef(null);
  const { menuProps } = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      className="m-0 p-0 list-none min-w-[250px] outline-none"
    >
      {[...state.collection].map((item) => (
        <MenuItem key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}
