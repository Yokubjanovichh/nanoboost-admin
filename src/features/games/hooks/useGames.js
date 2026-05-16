import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  listGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  uploadFile,
} from "@/features/games/services/games.api";

const KEYS = {
  all: ["games"],
  list: (params) => ["games", "list", params],
  detail: (id) => ["games", "detail", id],
};

export function useGamesList(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => listGames(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useGame(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getGame(id),
    enabled: Boolean(id),
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createGame(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateGame(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(KEYS.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }) => uploadFile({ file, folder }),
  });
}
