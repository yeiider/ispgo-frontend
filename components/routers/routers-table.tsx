"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, RefreshCw, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Router } from "@/lib/graphql/types"
import { getRouters, deleteRouter } from "@/app/actions/routers"

interface PaginatorInfo {
  count: number
  total: number
}

export function RoutersTable() {
  const [routers, setRouters] = useState<Router[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [paginatorInfo, setPaginatorInfo] = useState<PaginatorInfo | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routerToDelete, setRouterToDelete] = useState<Router | null>(null)
  const [deleting, setDeleting] = useState(false)
  const perPage = 10

  const fetchRouters = async (page = 1) => {
    setLoading(true)
    try {
      const result = await getRouters(page, perPage)
      if (result.success && result.data) {
        setRouters(result.data)
        setPaginatorInfo(result.paginatorInfo || null)
      }
    } catch (error) {
      console.error("Error fetching routers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRouters(currentPage)
  }, [currentPage])

  const filteredRouters = routers.filter((r) => {
    return r.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleDelete = async () => {
    if (!routerToDelete) return
    setDeleting(true)
    try {
      const result = await deleteRouter(routerToDelete.id)
      if (result.success) {
        fetchRouters(currentPage)
      }
    } catch (error) {
      console.error("Error deleting router:", error)
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setRouterToDelete(null)
    }
  }

  const lastPage = paginatorInfo ? Math.ceil(paginatorInfo.total / perPage) : 1
  const hasMorePages = currentPage < lastPage

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            Routers
          </h1>
          <p className="text-muted-foreground">Gestiona los routers de tu red para segmentacion</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchRouters(currentPage)} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button asChild className="gap-2">
            <Link href="/routers/new">
              <Plus className="h-4 w-4" />
              Nuevo Router
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{paginatorInfo?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total Routers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Server className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{routers.length}</p>
                <p className="text-sm text-muted-foreground">En esta pagina</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista de Routers</CardTitle>
              <CardDescription>Equipos de red para segmentacion de clientes y servicios</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRouters.length === 0 ? (
            <div className="text-center py-12">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No se encontraron routers</p>
              <Button asChild className="mt-4">
                <Link href="/routers/new">Agregar Router</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Nombre</TableHead>
                      <TableHead className="text-right font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRouters.map((r) => (
                      <TableRow key={r.id} className="hover:bg-secondary/30">
                        <TableCell className="font-mono text-sm">#{r.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Server className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{r.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                              <Link href={`/routers/${r.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                              <Link href={`/routers/${r.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                setRouterToDelete(r)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {paginatorInfo && lastPage > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, paginatorInfo.total)}{" "}
                    de {paginatorInfo.total} routers
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm px-3">
                      {currentPage} / {lastPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                      disabled={!hasMorePages}
                      className="gap-1"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar router?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente el router{" "}
              <span className="font-semibold">{routerToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
