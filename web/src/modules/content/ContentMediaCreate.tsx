import { MediaContentClient } from "~/models/content";
import MDEditor from "@uiw/react-md-editor";

interface ContentMedaiInfoEditProps {
  bodyValue: string;
  onBodyChange: (value: string) => void;
}

export default function ContentMediaCreate(props: ContentMedaiInfoEditProps) {
  const { bodyValue, onBodyChange } = props;

  return (
    <>
      <p className="font-bold uppercase text-primary">Content Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Title</p>
          <input className="input" defaultValue={""} />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Author</p>
          <input className="input" defaultValue={""} />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Description</p>
          <textarea className="textarea">{""}</textarea>
        </div>

        <div className="flex flex-col justify-start gap-2">
          <p className="font-bold">Body</p>
          <MDEditor
            value={bodyValue}
            onChange={(val) => onBodyChange(val || "")}
            height={400}
            preview="edit"
            commandsFilter={(cmd) =>
              !["preview", "live"].includes(cmd.name as string) && cmd
            }
          />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Category</p>
          <p>{""}</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Tags</p>

          <div className="flex gap-1">
            {/* {tags && (
              <>
                {tags?.map((tag) => {
                  return (
                    <span key={tag} className="badge">
                      {tag}
                    </span>
                  );
                })}
              </>
            )} */}
          </div>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Created At</p>
          <input className="input" type="date" value={""} />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Update At</p>
          <input className="input" type="date" value={""} />
        </div>
      </div>
    </>
  );
}
