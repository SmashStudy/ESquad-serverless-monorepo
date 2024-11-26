import { useEffect } from "react";
import { debounce } from "../utils/debounce";

const useInfiniteScroll = (ref, fetchMoreData, isFetching, lastEvaluatedKey, debounceDelay = 300) => {
    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;
        const debouncedScrollHandler = debounce(async () => {
            if (element.scrollHeight - element.scrollTop - element.clientHeight <= 100 && !isFetching && lastEvaluatedKey) {
                await fetchMoreData(lastEvaluatedKey);
            }
        }, debounceDelay);

        element.addEventListener("scroll", debouncedScrollHandler);

        return () => {
            element.removeEventListener("scroll", debouncedScrollHandler);
        };
    }, [ref, fetchMoreData, isFetching, lastEvaluatedKey, debounceDelay]);
};

export default useInfiniteScroll;