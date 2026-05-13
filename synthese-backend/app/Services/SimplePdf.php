<?php

namespace App\Services;

class SimplePdf
{
    public static function document(string $title, array $lines): string
    {
        return self::structured([
            'title' => $title,
            'subtitle' => 'Office de la Formation Professionnelle et de la Promotion du Travail',
            'metadata' => [],
            'sections' => [
                ['title' => 'Informations', 'rows' => array_map(fn ($line) => [$line, ''], $lines)],
            ],
            'signature' => true,
        ]);
    }

    public static function structured(array $document): string
    {
        $ops = [];
        $y = 802;

        self::text($ops, 'OFPPT', 46, $y, 22);
        self::text($ops, 'Plateforme nationale de gestion des formations', 118, $y + 3, 9);
        self::line($ops, 46, 782, 549, 782);
        $y = 748;

        self::text($ops, (string) ($document['title'] ?? 'Document OFPPT'), 46, $y, 21);
        $y -= 18;
        self::text($ops, (string) ($document['subtitle'] ?? 'Document officiel'), 46, $y, 10);
        $y -= 22;

        $metadata = $document['metadata'] ?? [];
        if ($metadata) {
            self::box($ops, 46, $y - 42, 503, 50);
            $x = 58;
            foreach ($metadata as $label => $value) {
                self::text($ops, strtoupper((string) $label), $x, $y, 6.8);
                self::text($ops, self::value($value), $x, $y - 12, 9);
                $x += 122;
                if ($x > 450) {
                    $x = 58;
                    $y -= 27;
                }
            }
            $y -= 60;
        }

        foreach ($document['sections'] ?? [] as $section) {
            if ($y < 120) {
                break;
            }
            self::text($ops, (string) ($section['title'] ?? 'Section'), 46, $y, 13);
            $y -= 16;
            foreach (($section['rows'] ?? []) as $row) {
                if ($y < 92) {
                    break 2;
                }
                [$label, $value] = array_pad((array) $row, 2, '');
                self::box($ops, 46, $y - 18, 503, 24);
                self::text($ops, self::value($label), 58, $y - 4, 8.5);
                self::text($ops, self::value($value), 220, $y - 4, 8.5);
                $y -= 25;
            }
            if (! empty($section['paragraph'])) {
                foreach (self::wrap((string) $section['paragraph'], 96) as $line) {
                    self::text($ops, $line, 58, $y, 9.5);
                    $y -= 13;
                }
            }
            $y -= 12;
        }

        if (! empty($document['signature'])) {
            self::line($ops, 335, 118, 515, 118);
            self::text($ops, 'Signature et cachet OFPPT', 360, 102, 9);
        }

        self::line($ops, 46, 58, 549, 58);
        self::text($ops, 'Document genere le '.date('Y-m-d H:i').' - OFPPT', 46, 42, 7.5);
        self::text($ops, 'Document structure - aucun element interface web inclus', 354, 42, 7.5);

        return self::render(implode("\n", $ops));
    }

    private static function render(string $content): string
    {
        $objects = [
            "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
            "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
            "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
            "6 0 obj\n<< /Length ".strlen($content)." >>\nstream\n{$content}\nendstream\nendobj\n",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object;
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= str_pad((string) $offset, 10, '0', STR_PAD_LEFT)." 00000 n \n";
        }

        return $pdf."trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
    }

    private static function text(array &$ops, string $text, int|float $x, int|float $y, int|float $size, bool $bold = false): void
    {
        $font = $bold || $size >= 12 ? 'F2' : 'F1';
        $ops[] = "BT /{$font} {$size} Tf {$x} {$y} Td (".self::escape($text).") Tj ET";
    }

    private static function line(array &$ops, int|float $x1, int|float $y1, int|float $x2, int|float $y2): void
    {
        $ops[] = "0.55 w {$x1} {$y1} m {$x2} {$y2} l S";
    }

    private static function box(array &$ops, int|float $x, int|float $y, int|float $w, int|float $h): void
    {
        $ops[] = "0.35 w {$x} {$y} {$w} {$h} re S";
    }

    private static function value(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '-';
        }
        if (is_bool($value)) {
            return $value ? 'Oui' : 'Non';
        }
        return (string) $value;
    }

    private static function wrap(string $text, int $width): array
    {
        return explode("\n", wordwrap($text, $width, "\n", true));
    }

    private static function escape(string $text): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text));
        $text = iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $text) ?: $text;
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    }
}
