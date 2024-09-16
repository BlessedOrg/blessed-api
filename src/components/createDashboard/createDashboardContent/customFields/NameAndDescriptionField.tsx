import { Card } from "@/components/Card";
import { DetailedHTMLProps, HTMLAttributes, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import Image from "next/image";

interface IProps {
  form: UseFormReturn<FieldValues, any, undefined>;
}
export const NameAndDescriptionField = ({
  form,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & IProps) => {
  const { setValue, watch } = form;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const currentName = watch("name");
  const currentDescription = watch("description");
  const [editedDescription, setEditedDescription] = useState<string>(currentDescription || "Description");
  const [editedName, setEditedName] = useState<string>(currentName || "Name");
  const toggleIsEditingName = () => {
    setIsEditingName((prev) => !prev);
  };
  const toggleIsEditingDescription = () => {
    setIsEditingDescription((prev) => !prev);
  };
  const onSaveEditedName = () => {
    setValue("name", editedName);
    setEditedName("");
    toggleIsEditingName();
  };

  const onSaveEditedDescription = () => {
    setValue("description", editedDescription);
    setEditedDescription("");
    toggleIsEditingDescription();
  };
  const onCancelNameEdit = () => {
    toggleIsEditingName();
    setEditedName("");
  };
  const onCancelDescriptionEdit = () => {
    toggleIsEditingDescription();
    setEditedDescription("");
  };
  return (
    <Card {...props}>
      <div className="flex gap-2 w-full">
        <div className="flex flex-col gap-2 w-full">
          <div className="gap-2 flex items-center w-full">
            <h2 className={`font-semibold text-xl ${isEditingName ? "hidden" : ""}`}>{currentName || "Name"}</h2>
            <input
              type="text"
              id="name"
              className={`text-xl ${!isEditingName ? "hidden" : ""} p-0 font-semibold border-1 border-gray-500`}
              onChange={(e) => setEditedName(e.target.value)}
              value={!!editedName ? editedName : currentName || "Name"}
            />
            {!isEditingName && (
              <button onClick={toggleIsEditingName}>
                <Pencil size={20} />
              </button>
            )}
            {isEditingName && (
              <div className="flex gap-2">
                <button onClick={onSaveEditedName}>
                  <Check size={20} />
                </button>
                <button onClick={onCancelNameEdit}>
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              id="description"
              className={`${!isEditingDescription ? "hidden" : ""} p-0 border-1 border-gray-500 w-full`}
              onChange={(e) => setEditedDescription(e.target.value)}
              value={!!editedDescription ? editedDescription : currentDescription || "Description"}
            />
            <p className={`${isEditingDescription ? "hidden" : ""}`}>
              {currentDescription || "Description"}{" "}
              {!isEditingDescription && (
                <button onClick={toggleIsEditingDescription}>
                  <Pencil size={20} />
                </button>
              )}
            </p>

            {isEditingDescription && (
              <div className="flex gap-2">
                <button onClick={onSaveEditedDescription}>
                  <Check size={20} />
                </button>
                <button onClick={onCancelDescriptionEdit}>
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
        <Image src={"/img/placeholder_image.jpeg"} alt="" width={175} height={175} className="rounded-2xl" />
      </div>
    </Card>
  );
};
