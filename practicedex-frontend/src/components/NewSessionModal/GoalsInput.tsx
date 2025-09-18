import { useFieldArray, useForm } from "react-hook-form";
import { useEffect, useRef } from "react";

type GoalsFormProps = {
  setGoals: React.Dispatch<React.SetStateAction<string[]>>;
  initialGoals?: string[];
};

type GoalsFormValues = {
  goals: { value: string }[];
};

export default function GoalsForm({
  setGoals,
  initialGoals = [""],
}: GoalsFormProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalsFormValues>({
    defaultValues: {
      goals: initialGoals.map((goal) => ({ value: goal })),
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "goals",
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Watch all goals
  // Watch the form in real-time
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.goals) {
        const goalValues = value.goals
          .filter((g): g is { value: string } =>
            Boolean(g && g.value && g.value.trim() !== "")
          )
          .map((g) => g.value);
        setGoals(goalValues);
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [watch, setGoals]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === fields.length - 1) {
        append({ value: "" });
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      } else {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (index === fields.length - 1) {
        append({ value: "" });
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      } else {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (index < fields.length - 1) {
        inputRefs.current[index + 1]?.focus();
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
              {...register(`goals.${index}.value` as const, {
                onChange: (e) => {
                  setValue(`goals.${index}.value`, e.target.value, {
                    shouldValidate: true,
                  });
                },
              })}
              placeholder={`Goal ${index + 1}`}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              autoComplete="off"
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-2xl text-red-500 hover:text-red-700"
                aria-label="Remove goal"
                tabIndex={-1}
              >
                ×
              </button>
            )}
            {errors?.goals?.[index]?.value && (
              <p className="text-red-500 text-sm mt-1 col-span-full">
                {errors.goals[index]?.value?.message}
              </p>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            append({ value: "" });
            setTimeout(() => {
              inputRefs.current[fields.length]?.focus();
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
