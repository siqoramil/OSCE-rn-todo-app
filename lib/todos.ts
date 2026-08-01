import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  /** Deadline chosen by the user, or null when the task has no due date. */
  dueAt: Date | null;
};

// Todos live under users/{uid}/todos so each account only ever touches its own
// data (enforced by the Firestore security rules — see README).
function todosCollection(uid: string) {
  return collection(db, 'users', uid, 'todos');
}

function todoDoc(uid: string, id: string) {
  return doc(db, 'users', uid, 'todos', id);
}

// Firestore hands back a Timestamp; the rest of the app only wants a Date.
// Documents written before due dates existed have no such field, hence null.
function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
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
              dueAt: toDate(data.dueAt),
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

export async function addTodo(uid: string, title: string, dueAt?: Date | null) {
  await addDoc(todosCollection(uid), {
    title: title.trim(),
    done: false,
    dueAt: dueAt ? Timestamp.fromDate(dueAt) : null,
    createdAt: serverTimestamp(),
  });
}

/** Updates title and due date together — they are edited as a single form. */
export async function updateTodo(
  uid: string,
  id: string,
  title: string,
  dueAt: Date | null
) {
  await updateDoc(todoDoc(uid, id), {
    title: title.trim(),
    dueAt: dueAt ? Timestamp.fromDate(dueAt) : null,
  });
}

export async function toggleTodo(uid: string, id: string, done: boolean) {
  await updateDoc(todoDoc(uid, id), { done });
}

export async function deleteTodo(uid: string, id: string) {
  await deleteDoc(todoDoc(uid, id));
}

/** True when a task has a deadline in the past and is still not done. */
export function isOverdue(todo: Todo, now: Date = new Date()): boolean {
  return (
    !todo.done && todo.dueAt !== null && todo.dueAt.getTime() < now.getTime()
  );
}
