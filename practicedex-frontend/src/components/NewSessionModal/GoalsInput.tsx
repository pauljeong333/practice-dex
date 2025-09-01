import { useFieldArray, useForm } from "react-hook-form";
import { useEffect, useRef } from "react";

type Goal = {
  text: string;
};

type GoalsFormProps = {
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  initialGoals?: Goal[];
};

export default function GoalsForm({
  setGoals,
  initialGoals = [{ text: "" }],
}: GoalsFormProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useForm<{ goals: Goal[] }>({
    defaultValues: {
      goals: initialGoals,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "goals",
  });

  // Keep refs for inputs so we can focus dynamically
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Watch all changes to goals and update the parent state
  const watchedGoals = watch("goals");
  useEffect(() => {
    setGoals(watchedGoals);
  }, [watchedGoals, setGoals]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === fields.length - 1) {
        append({ text: "" });
        setTimeout(() => {
          const nextInput = inputRefs.current[index + 1];
          nextInput?.focus();
        }, 0);
      } else {
        const nextInput = inputRefs.current[index + 1];
        nextInput?.focus();
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index > 0) {
        const prevInput = inputRefs.current[index - 1];
        prevInput?.focus();
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (index < fields.length - 1) {
        const nextInput = inputRefs.current[index + 1];
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-1">Goals</label>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              {...register(`goals.${index}.text`, {
                required: "Goal cannot be empty",
              })}
              placeholder={`Goal ${index + 1}`}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:text-red-700"
                aria-label="Remove goal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            {errors?.goals?.[index]?.text && (
              <p className="text-red-500 text-sm mt-1 col-span-full">
                {errors.goals[index]?.text?.message}
              </p>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            append({ text: "" });
            setTimeout(() => {
              const lastInput = inputRefs.current[fields.length];
              lastInput?.focus();
            }, 0);
          }}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
