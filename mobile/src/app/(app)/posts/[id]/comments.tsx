import { useLocalSearchParams } from 'expo-router';

import { CommentsSheet } from '@/features/comments/comments-sheet';

/** Folha de comentários de uma postagem (`formSheet`, configurada em `(app)/_layout.tsx`). */
export default function PostCommentsSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CommentsSheet postId={id} />;
}
