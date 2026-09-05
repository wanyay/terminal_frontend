import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { cn, getPageNumbers } from '@/lib/utils'
import { useTranslation } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PaginationData {
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  perPage: number
  totalPages: number
  totalRecords: number
}

interface ServerSidePaginationProps {
  pagination: PaginationData
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  pageSizeOptions?: number[]
}

export default function ServerSidePagination({
  pagination,
  onPageChange,
  onPerPageChange,
  pageSizeOptions = [10, 20, 30, 50],
}: ServerSidePaginationProps) {
  const { t } = useTranslation()
  const {
    currentPage,
    hasNextPage,
    hasPrevPage,
    perPage,
    totalPages,
    //  totalRecords
  } = pagination

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const goToPage = (page: number) => {
    if (onPageChange) onPageChange(page)
  }

  const handlePerPageChange = (value: string) => {
    const newPerPage = Number(value)
    if (onPerPageChange) onPerPageChange(newPerPage)
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)

  return (
    <div
      className={cn(
        'flex items-center justify-between overflow-clip px-2',
        '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4'
      )}
      style={{ overflowClipMargin: 1 }}
    >
      <div className='flex w-full items-center justify-between'>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium @2xl/content:hidden'>
          {t('common.pageOf' as never, { current: currentPage, total: totalPages })}
        </div>
        <div className='flex items-center gap-2 @max-2xl/content:flex-row-reverse'>
          <Select
            value={perPage.toString()}
            onValueChange={handlePerPageChange}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={perPage.toString()} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='hidden text-sm font-medium sm:block'>{t('common.rows' as never)}</p>
        </div>
      </div>

      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium @max-3xl/content:hidden'>
          {t('common.pageOf' as never, { current: currentPage, total: totalPages })}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='size-8 p-0 @max-md/content:hidden'
            onClick={goToFirstPage}
            disabled={!hasPrevPage}
          >
            <span className='sr-only'>{t('common.goToFirstPage' as never)}</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={goToPrevPage}
            disabled={!hasPrevPage}
          >
            <span className='sr-only'>{t('common.goToPreviousPage' as never)}</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>

          {/* Page number buttons */}
          {pageNumbers.map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className='flex items-center'>
              {pageNumber === '...' ? (
                <span className='text-muted-foreground px-1 text-sm'>...</span>
              ) : (
                <Button
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  className='h-8 min-w-8 px-2'
                  onClick={() => goToPage(pageNumber as number)}
                >
                  <span className='sr-only'>{t('common.goToPage' as never, { page: pageNumber as number })}</span>
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={goToNextPage}
            disabled={!hasNextPage}
          >
            <span className='sr-only'>{t('common.goToNextPage' as never)}</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0 @max-md/content:hidden'
            onClick={goToLastPage}
            disabled={!hasNextPage}
          >
            <span className='sr-only'>{t('common.goToLastPage' as never)}</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
