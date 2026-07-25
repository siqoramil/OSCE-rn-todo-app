import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

// Todos live under users/{uid}/todos so each account only ever touches its own
// data (enforced by the Firestore security rules — see README).
function todosCollection(uid: string) {
  return collection(db, 'users', uid, 'todos');
}

export function useTodos(uid: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(todosCollection(uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTodos(
          snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: (data.title as string) ?? '',
              done: Boolean(data.done),
            };
          })
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  return { todos, loading, error };
}

export async function addTodo(uid: string, title: string) {
  await addDoc(todosCollection(uid), {
    title: title.trim(),
    done: false,
    createdAt: serverTimestamp(),
  });
}

export async function setTodoTitle(uid: string, id: string, title: string) {
  await updateDoc(doc(db, 'users', uid, 'todos', id), { title: title.trim() });
}

export async function toggleTodo(uid: string, id: string, done: boolean) {
  await updateDoc(doc(db, 'users', uid, 'todos', id), { done });
}

export async function deleteTodo(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'todos', id));
}
