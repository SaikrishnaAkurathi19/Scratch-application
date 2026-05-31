import { create } from 'zustand';
import { List } from '../types';
import * as ListQueries from '../db/queries/lists';
import { getTaskCountByList } from '../db/queries/tasks';

interface ListStore {
  lists: List[];
  loadLists: () => void;
  createList: (data: Parameters<typeof ListQueries.createList>[0]) => List;
  updateList: (id: string, data: Parameters<typeof ListQueries.updateList>[1]) => void;
  deleteList: (id: string) => void;
  getTaskCount: (listId: string) => number;
}

export const useListStore = create<ListStore>((set, get) => ({
  lists: [],

  loadLists: () => {
    const lists = ListQueries.getAllLists();
    set({ lists });
  },

  createList: (data) => {
    const list = ListQueries.createList(data);
    get().loadLists();
    return list;
  },

  updateList: (id, data) => {
    ListQueries.updateList(id, data);
    get().loadLists();
  },

  deleteList: (id) => {
    ListQueries.deleteList(id);
    get().loadLists();
  },

  getTaskCount: (listId) => getTaskCountByList(listId),
}));
