import React from "react";
import {
  AriaListBoxOptions,
  AriaListBoxProps,
  useListBox,
  useOption,
} from "react-aria";
import { ListState, Node } from "react-stately";
import cn from "classnames";

type OptionProps = {
  item: Node<unknown>;
  state: ListState<unknown>;
};

function Option({ item, state }: OptionProps) {
  let ref = React.useRef(null);
  let { optionProps, isSelected, isFocused, isDisabled } = useOption(
    { key: item.key },
    state,
    ref
  );

  return (
    <li
      {...optionProps}
      ref={ref}
      className={cn(
        "px-2 py-1 outline-none cursor-pointer flex justify-between gap-2",
        { "bg-gray-300": isFocused }
      )}
    >
      {item.rendered}
      {isSelected ? <span>✓</span> : null}
    </li>
  );
}

type ListBoxProps = {
  state: ListState<unknown>;
} & AriaListBoxOptions<object>;

export default function ListBox(props: ListBoxProps) {
  let ref = React.useRef(null);
  let { state } = props;
  let { listBoxProps } = useListBox(props, state, ref);

  return (
    <ul
      {...listBoxProps}
      ref={ref}
      className="m-0 p-0 list-none overflow-auto max-h-[150px] min-w-[100px] bg-gray-300"
    >
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}
