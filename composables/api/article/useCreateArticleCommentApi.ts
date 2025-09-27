import type { Comment, CreateArticleComment200Response, CreateArticleCommentRequest } from '~/lib/api/__generated__'
import { apiFetch } from '~/lib/api/apiFetch'

interface Options {
  articleSlug: MaybeRefOrGetter<string>
  comments: MaybeRefOrGetter<Comment[] | undefined>
  commentBody: Ref<string> | (() => string) | string
}

export default function useCreateArticleCommentApi(opts: Options) {
  const response = useLazyAsyncData<CreateArticleCommentRequest, Error, CreateArticleComment200Response>(
    () => {
      let comments = toValue(opts.comments)
      const commentBody = toValue(opts.commentBody)
      const previousComments = comments
      const previousCommentBody = commentBody
      const slug = toValue(opts.articleSlug)
      return apiFetch(`/articles/${slug}/comments`, {
        method: 'POST',
        body: { comment: { body: commentBody } },
        onResponse: ({ response }) => {
          if (isRef(opts.commentBody)) {
            try {
              opts.commentBody.value = ''
            }
            catch {
              // Comment body is readonly, ignore
            }
          }
          comments?.push?.(response._data.comment)
        },
        onRequestError: () => {
          comments = previousComments
          if (isRef(opts.commentBody)) {
            try {
              opts.commentBody.value = previousCommentBody
            }
            catch {
              // Comment body is readonly, ignore
            }
          }
        },
      })
    },
    { immediate: false, deep: false },
  )

  const isPostingComment = computed(() => response.status?.value === 'pending')

  return { ...response, isPostingComment: isPostingComment.value }
}
