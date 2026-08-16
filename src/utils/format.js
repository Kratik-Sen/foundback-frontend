import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (value, pattern = 'dd MMM yyyy') => value ? format(new Date(value), pattern) : '—'
export const timeAgo = (value) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : ''
export const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
export const initials = (name = 'Campus User') => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
