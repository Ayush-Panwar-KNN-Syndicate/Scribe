import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pages } from "@/data/staticPage";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle,Globe,Loader2,RefreshCw,Trash2, Upload, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { checkStaticPagesStatus, publishAboutPage, publishArticlesPage, publishContactPage, publishHomepage, publishPrivacyPage, publishSearchPage, publishTermsPage, unpublishAboutPage, unpublishArticlesPage, unpublishContactPage, unpublishHomepage, unpublishPrivacyPage, unpublishSearchPage, unpublishTermsPage } from "./actions";

interface PageStatus {
    published: boolean
    url: string
}

interface PublishResult {
    page: string
    url: string
    success: boolean
}

export default function StaticPagesection(
    {
  isAdminUser,
  isCheckingAdmin
}: {
  isAdminUser: boolean | null;
  isCheckingAdmin: boolean | null;
}
) {
    const [statusLastChecked, setStatusLastChecked] = useState<Date | null>(null)
    const [pageStatuses, setPageStatuses] = useState<Record<string, PageStatus>>({})
    const [isCheckingStatus, setIsCheckingStatus] = useState(false)
    const [isUnpublishing, setIsUnpublishing] = useState<Record<string, boolean>>({})
    const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({})
    const [isPublishing, setIsPublishing] = useState<Record<string, boolean>>({})
    const isPagePublished = (pageType: string) => {
        const status = pageStatuses[pageType]
        return status?.published || false
    }

    const checkStatus = async () => {
        setIsCheckingStatus(true)
        try {
            const statuses = await checkStaticPagesStatus();
            console.log("statuses",statuses);
            setPageStatuses({
                homepage: statuses.homepage,
                about: statuses.about,
                contact: statuses.contact,
                privacy: statuses.privacy,
                terms: statuses.terms,
                articles: statuses.articles,
                search: statuses.search
            })
            setStatusLastChecked(new Date())
        } catch (error) {
            console.error('Failed to check page statuses:', error)
        } finally {
            setIsCheckingStatus(false)
        }
    }

      useEffect(() => {
        if (isAdminUser && !isCheckingAdmin) {
          checkStatus()
        }
      }, [isAdminUser,isCheckingAdmin])

    const handlePublishPage = async (pageType: 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search') => {
        setIsPublishing(prev => ({ ...prev, [pageType]: true }))
        try {
            let result
            switch (pageType) {
                case 'homepage':
                    result = await publishHomepage()
                    break
                case 'about':
                    result = await publishAboutPage()
                    break
                case 'contact':
                    result = await publishContactPage()
                    break
                case 'privacy':
                    result = await publishPrivacyPage()
                    break
                case 'terms':
                    result = await publishTermsPage()
                    break
                case 'articles':
                    result = await publishArticlesPage()
                    break
                case 'search':
                    result = await publishSearchPage()
                    break
                default:
                    throw new Error(`Unknown page type: ${pageType}`)
            }

            setPublishResults(prev => ({
                ...prev,
                [pageType]: {
                    page: pageType,
                    url: result.url,
                    success: true
                }
            }))

            // Refresh status
            await checkStatus()

        } catch (error) {
            setPublishResults(prev => ({
                ...prev,
                [pageType]: {
                    page: pageType,
                    url: '',
                    success: false
                }
            }))
            console.error(`Failed to publish ${pageType}:`, error)
        } finally {
            setIsPublishing(prev => ({ ...prev, [pageType]: false }))
        }
    }


    const handleUnpublishPage = async (pageType: 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search') => {
        setIsUnpublishing(prev => ({ ...prev, [pageType]: true }))

        try {
            switch (pageType) {
                case 'homepage':
                    await unpublishHomepage()
                    break
                case 'about':
                    await unpublishAboutPage()
                    break
                case 'contact':
                    await unpublishContactPage()
                    break
                case 'privacy':
                    await unpublishPrivacyPage()
                    break
                case 'terms':
                    await unpublishTermsPage()
                    break
                case 'articles':
                    await unpublishArticlesPage()
                    break
                case 'search':
                    await unpublishSearchPage()
                    break
                default:
                    throw new Error(`Unknown page type: ${pageType}`)
            }

            // Refresh status
            await checkStatus()

        } catch (error) {
            console.error(`Failed to unpublish ${pageType}:`, error)
        } finally {
            setIsUnpublishing(prev => ({ ...prev, [pageType]: false }))
        }
    }


    const getPageUrl = (pageType: string) => {
        const status = pageStatuses[pageType]
        if (status) return status.url

        const result = publishResults[pageType]
        return result?.url || ''
    }


    const getStatusBadge = (pageType: string) => {
        const status = pageStatuses[pageType]
        const result = publishResults[pageType]
        // If we have R2 status, use that as the source of truth
        if (status) {
            return status.published
                ? <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>
                : <Badge variant="outline">Not Published</Badge>
        }
        // Fallback to publish result if no R2 status yet
        if (!result) return <Badge variant="outline">Not Published</Badge>
        return result.success
            ? <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>
            : <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
    }

    return (
        <>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={checkStatus}
            disabled={isCheckingStatus}
            className="min-w-[120px]"
          >
            {(isCheckingStatus) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </>
            )}
          </Button>
        </div>
            {/* Status Information */}
            <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                    <div className="flex items-center justify-between">
                        <span>
                            Static pages are published to Cloudflare R2 with URL rewrite rules for custom domain routing.
                            Status is checked against R2 as the source of truth.
                        </span>
                        {statusLastChecked && (
                            <span className="text-xs text-muted-foreground">
                                Last checked: {statusLastChecked.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </AlertDescription>
            </Alert>

            {/* Individual Pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                    <Card key={page.id} className="relative">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <page.icon className="w-6 h-6 text-primary" />
                                    <CardTitle className="text-lg">{page.title}</CardTitle>
                                </div>
                                {getStatusBadge(page.id)}
                            </div>
                            <p className="text-sm text-muted-foreground">{page.description}</p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Features:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {page.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-2">
                                {isPagePublished(page.id) ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleUnpublishPage(page.id as 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search')}
                                        disabled={isUnpublishing[page.id]}
                                        className="w-full"
                                    >
                                        {isUnpublishing[page.id] ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Unpublishing...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Unpublish {page.title}
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handlePublishPage(page.id as 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search')}
                                        disabled={isPublishing[page.id]}
                                        className="w-full"
                                    >
                                        {isPublishing[page.id] ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Publish {page.title}
                                            </>
                                        )}
                                    </Button>
                                )}

                                {getPageUrl(page.id) && isPagePublished(page.id) && (
                                    <a
                                        href={getPageUrl(page.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-center"
                                    >
                                        <Button variant="outline" className="w-full" disabled={isPublishing[page.id] || isUnpublishing[page.id]}>
                                            <Globe className="w-4 h-4 mr-2" />
                                            View Live Page
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}