import { useFieldArray, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

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
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useForm<GoalsFormValues>({
    defaultValues: {
      goals: [{ value: "" }],
    },
    mode: "onChange",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "goals",
  });

  // Use replace to initialize with initialGoals
  useEffect(() => {
    if (initialGoals && initialGoals.length > 0 && !isInitialized) {
      const formattedGoals =
        initialGoals[0] !== ""
          ? initialGoals.map((goal) => ({ value: goal }))
          : [{ value: "" }];

      replace(formattedGoals);
      setIsInitialized(true);
    }
  }, [initialGoals, replace, isInitialized]);

  // Watch for changes and update parent
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.goals) {
        const goalValues = value.goals
          .filter((g): g is { value: string } =>
            Boolean(g && g.value !== undefined)
          )
          .map((g) => g.value);
        const filteredGoals = goalValues.filter((goal) => goal.trim() !== "");
        setGoals(filteredGoals);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setGoals]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Helper function to merge refs
  const setRefs = (index: number) => (el: HTMLInputElement | null) => {
    const { ref } = register(`goals.${index}.value` as const);
    if (typeof ref === "function") {
      ref(el);
    }
    inputRefs.current[index] = el;
  };

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
              {...register(`goals.${index}.value` as const)}
              placeholder={`Goal ${index + 1}`}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={setRefs(index)}
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
