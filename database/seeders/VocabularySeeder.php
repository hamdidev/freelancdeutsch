<?php

namespace Database\Seeders;

use App\Models\VocabularyCard;
use Illuminate\Database\Seeder;

class VocabularySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cards = [
            // IT domain
            ['term_de' => 'die Anforderung',       'term_en' => 'requirement',        'domain' => 'it',     'level' => 'B1', 'example_de' => 'Die Anforderungen wurden im Lastenheft festgehalten.',             'example_en' => 'The requirements were recorded in the specification sheet.'],
            ['term_de' => 'die Schnittstelle',     'term_en' => 'interface / API',    'domain' => 'it',     'level' => 'B1', 'example_de' => 'Wir integrieren eine REST-Schnittstelle.',                        'example_en' => 'We are integrating a REST interface.'],
            ['term_de' => 'die Wartung',           'term_en' => 'maintenance',        'domain' => 'it',     'level' => 'B1', 'example_de' => 'Die Wartung des Systems erfolgt monatlich.',                      'example_en' => 'System maintenance is carried out monthly.'],
            ['term_de' => 'das Pflichtenheft',     'term_en' => 'functional spec',    'domain' => 'it',     'level' => 'B2', 'example_de' => 'Das Pflichtenheft beschreibt alle Funktionen.',                   'example_en' => 'The functional spec describes all features.'],
            ['term_de' => 'die Abnahme',           'term_en' => 'acceptance/sign-off', 'domain' => 'it',     'level' => 'B2', 'example_de' => 'Nach der Abnahme beginnt die Gewährleistung.',                   'example_en' => 'The warranty starts after acceptance.'],
            ['term_de' => 'das Deployment',        'term_en' => 'deployment',         'domain' => 'it',     'level' => 'B1', 'example_de' => 'Das Deployment erfolgt jeden Freitag.',                           'example_en' => 'Deployment happens every Friday.'],
            ['term_de' => 'die Fehlerbehebung',    'term_en' => 'bug fixing',         'domain' => 'it',     'level' => 'B1', 'example_de' => 'Die Fehlerbehebung dauert zwei Tage.',                           'example_en' => 'Bug fixing will take two days.'],
            ['term_de' => 'agile Entwicklung',     'term_en' => 'agile development',  'domain' => 'it',     'level' => 'B1', 'example_de' => 'Wir arbeiten nach agiler Entwicklung.',                          'example_en' => 'We work with agile development.'],

            // Legal domain
            ['term_de' => 'der Auftraggeber',      'term_en' => 'client / principal', 'domain' => 'legal',  'level' => 'B2', 'example_de' => 'Der Auftraggeber hat das Recht, die Arbeit abzunehmen.',         'example_en' => 'The client has the right to accept the work.'],
            ['term_de' => 'der Auftragnehmer',     'term_en' => 'contractor',         'domain' => 'legal',  'level' => 'B2', 'example_de' => 'Der Auftragnehmer ist selbständig tätig.',                       'example_en' => 'The contractor works independently.'],
            ['term_de' => 'die Haftung',           'term_en' => 'liability',          'domain' => 'legal',  'level' => 'B2', 'example_de' => 'Die Haftung ist auf den Auftragswert begrenzt.',                 'example_en' => 'Liability is limited to the contract value.'],
            ['term_de' => 'die Kündigung',         'term_en' => 'termination',        'domain' => 'legal',  'level' => 'B2', 'example_de' => 'Eine Kündigung ist mit 4 Wochen Frist möglich.',                 'example_en' => 'Termination is possible with 4 weeks notice.'],
            ['term_de' => 'die Geheimhaltung',     'term_en' => 'confidentiality',    'domain' => 'legal',  'level' => 'B2', 'example_de' => 'Geheimhaltung gilt für drei Jahre.',                             'example_en' => 'Confidentiality applies for three years.'],
            ['term_de' => 'das Urheberrecht',      'term_en' => 'copyright',          'domain' => 'legal',  'level' => 'C1', 'example_de' => 'Das Urheberrecht verbleibt beim Auftragnehmer.',                 'example_en' => 'Copyright remains with the contractor.'],

            // Finance domain
            ['term_de' => 'die Rechnung',          'term_en' => 'invoice',            'domain' => 'finance', 'level' => 'A2', 'example_de' => 'Ich stelle die Rechnung am Monatsende.',                         'example_en' => 'I issue the invoice at the end of the month.'],
            ['term_de' => 'das Zahlungsziel',      'term_en' => 'payment term',       'domain' => 'finance', 'level' => 'B1', 'example_de' => 'Das Zahlungsziel beträgt 14 Tage.',                              'example_en' => 'The payment term is 14 days.'],
            ['term_de' => 'die Mahnung',           'term_en' => 'payment reminder',   'domain' => 'finance', 'level' => 'B1', 'example_de' => 'Ich schicke eine Mahnung nach 30 Tagen.',                        'example_en' => 'I send a payment reminder after 30 days.'],
            ['term_de' => 'der Stundensatz',       'term_en' => 'hourly rate',        'domain' => 'finance', 'level' => 'B1', 'example_de' => 'Mein Stundensatz beträgt 95 Euro.',                              'example_en' => 'My hourly rate is 95 euros.'],
            ['term_de' => 'die Umsatzsteuer',      'term_en' => 'VAT / sales tax',    'domain' => 'finance', 'level' => 'B1', 'example_de' => 'Die Umsatzsteuer beträgt 19 Prozent.',                           'example_en' => 'The VAT rate is 19 percent.'],
            ['term_de' => 'der Skonto',            'term_en' => 'early payment discount', 'domain' => 'finance', 'level' => 'B2', 'example_de' => '2% Skonto bei Zahlung innerhalb von 7 Tagen.',               'example_en' => '2% discount for payment within 7 days.'],

            // Communication domain
            ['term_de' => 'Sehr geehrte Damen und Herren', 'term_en' => 'Dear Sir or Madam', 'domain' => 'communication', 'level' => 'A2', 'example_de' => 'Sehr geehrte Damen und Herren, ich wende mich an Sie...', 'example_en' => 'Dear Sir or Madam, I am writing to you...'],
            ['term_de' => 'Mit freundlichen Grüßen', 'term_en' => 'Kind regards',      'domain' => 'communication', 'level' => 'A2', 'example_de' => 'Mit freundlichen Grüßen, Hamdi Al-Taim',                  'example_en' => 'Kind regards, Hamdi Al-Taim'],
            ['term_de' => 'bezüglich',             'term_en' => 'regarding / re:',    'domain' => 'communication', 'level' => 'B1', 'example_de' => 'Bezüglich Ihres Angebots vom 1. April...',                'example_en' => 'Regarding your offer of 1 April...'],
            ['term_de' => 'in Rücksprache mit',    'term_en' => 'in consultation with', 'domain' => 'communication', 'level' => 'B2', 'example_de' => 'In Rücksprache mit meinem Team...',                       'example_en' => 'In consultation with my team...'],
        ];

        foreach ($cards as $card) {
            VocabularyCard::create([
                ...$card,
                'user_id' => null,  // null = system card, copied to user on first access
                'is_system' => true,
            ]);
        }
    }
}
