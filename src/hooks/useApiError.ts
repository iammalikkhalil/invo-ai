import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { parseApiError } from "@/utils/error";

export function useApiError() {
    const dispatch = useAppDispatch();

    const notifyError = (err: unknown, title = "Request failed") => {
        const desc = parseApiError(err);

        dispatch(
            pushToast({
                level: "error",
                title,
                description: desc
            })
        );
    };

    return { notifyError };
}
