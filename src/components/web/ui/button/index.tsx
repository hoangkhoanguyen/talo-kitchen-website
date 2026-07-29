import Icon from "@/components/common/Icon";
import { Button } from "./Button";
import { QuantityButtons } from "./QuantityButtons";
import Link from "next/link";

export * from "./Button";
export * from "./QuantityButtons";

export const Buttons = () => {
  return (
    <div className="flex flex-col gap-2 items-start p-10 bg-white">
      <Button>Reserve Your Table</Button>
      <Button variant={"secondary1"}>Reserve</Button>
      <Button variant={"secondary2"}>Reserve</Button>
      <Button variant={"white"} startIcon={<Icon icon="ph:caret-left-bold" />}>
        Prev
      </Button>
      <Button
        disabled
        variant={"white"}
        startIcon={<Icon icon="ph:caret-left-bold" />}
      >
        Prev
      </Button>
      <Button variant={"white"} endIcon={<Icon icon="ph:caret-right-bold" />}>
        Next
      </Button>
      <div className="p-5 bg-gray-400">
        <Button as={Link} href={"/"} variant={"link"}>
          Home
        </Button>
      </div>
      <QuantityButtons quantity={1} onChangeQuantity={() => {}} />
    </div>
  );
};
