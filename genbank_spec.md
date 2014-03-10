# Specifications for Genbank files

Genbank files contain one or more records. Each record contains the following

## Header section

Metadata about the sequence

### LOCUS line

Records must start with a locus line

Defines some metadata about the file, e.g.

    LOCUS       SCU49845     5028 bp    DNA             PLN       21-JUN-1999

The locus line is formatted according to

```
00:06      LOCUS
06:12      spaces
12:??      Locus name
??:??      space
??:40      Length of sequence, right-justified
40:44      space, bp/aa/rc, space
44:47      Blank, ss-, ds-, ms-
47:54      Blank, DNA, RNA, tRNA, mRNA, uRNA, snRNA, cDNA
54:55      space
55:63      Blank (implies linear), linear or circular
63:64      space
64:67      The division code (e.g. BCT, VRL, INV)
67:68      space
68:79      Date, in the form dd-MMM-yyyy (e.g., 15-MAR-1991)
```

Older files are formatted as

```
00:06      LOCUS
06:12      spaces
12:??      Locus name
??:??      space
??:29      Length of sequence, right-justified
29:33      space, bp/aa/rc, space
33:41      strand type
41:42      space
42:51      Blank (implies linear), linear or circular
51:52      space
52:55      The division code (e.g. BCT, VRL, INV)
55:62      space
62:73      Date, in the form dd-MMM-yyyy (e.g., 15-MAR-1991)
```

Note the change in position of bp/aa/rc can be used to determine the type

'rc' is not defined, maybe it means "Research Chemical" http://en.wikipedia.org/wiki/Research_chemical?

### Rest of the header

Contains more information about the record in a 
    KEY        Value as a string
structure. 
The Key part is 12 characters wide, with the value starting on the 13th.
The value can span several lines, but the first 12 characters of any following 
lines must remain blank.

Valid keys are:
- DEFINITION
- ACCESSION
- NID
- PID
- DBSOURCE
- KEYWORDS
- SEGMENT
- SOURCE
- ORGANISM *
- ORIGIN
- COMMENT
- VERSION
- PROJECT
- DBLINK
- REFERENCE
- AUTHORS *
- CONSRTM *
- TITLE *
- JOURNAL *
- MEDLINE *
- PUBMED *
- REMARK *

Items with asterisks are usually indented by two spaces showing that they refer 
to the most recent non-indented item,
This 
1) The order in which these keys appear in the file is important
2) An AUTHORS line which doesn't come after a REFERENCE line is a syntax error

## FEATURE table

Features refer to parts of the sequence and are initiated by the line
    FEATURES            Location/Qualifiers
Where "Location/Qualifiers" is optional

The feature table contains a list of features, each one began by a line of the form
         TYPE           location_string
Where type gives the type of the feature and location_string specifies it's 
location on the sequence, see below.

Features are then given qualifiers, which are indented by 21 spaces and of the format
    \KEY=VALUE
which can be split over multiple lines but each line must be indented.
VALUE may be an integer or a string encased in double-quotes (") and 
backslashes and "s in the string must be escaped with \.

location_string is defined by:

Location           |       Description   
-------------------|-------------------------------
467             |      Points to a single base in the presented sequence 
340..565         |         Points to a continuous range of bases bounded by and including the starting and ending bases
<345..500       |       Indicates that the exact lower boundary point of a feature is unknown.  The location begins at some  base previous to the first base specified (which need not be contained in the presented sequence) and continues to and includes the ending base 
<1..888           |        The feature starts before the first sequenced base and  continues to and includes base 888
1..>888           |       The feature starts at the first sequenced base and continues beyond base 888
102.110         |       Indicates that the exact location is unknown but that it is one of the bases between bases 102 and 110, inclusive
123^124          |         Points to a site between bases 123 and 124
join(12..78,134..202)  |   Regions 12 to 78 and 134 to 202 should be joined to form one contiguous sequence
complement(34..126)   |    Start at the base complementary to 126 and finish at the base complementary to base 34 (the feature is on the strand complementary to the presented strand)
complement(join(2691..4571,4918..5163)) | Joins regions 2691 to 4571 and 4918 to 5163, then complements the joined segments (the feature is on the strand complementary to the presented strand) 
join(complement(4918..5163),complement(2691..4571)) | Complements regions 4918 to 5163 and 2691 to 4571, then joins the complemented segments (the feature is on the strand complementary to the presented strand)
J00194.1:100..202      |   Points to bases 100 to 202, inclusive, in the entry (in this database) with primary accession number 'J00194'
join(1..100,J00194.1:100..202) | Joins region 1..100 of the existing entry with the region 100..202 of remote entry J00194


## Sequence section

This section begins with the keyword ORIGIN at the begining of a line.
The sequence is then printed in columnar format, for example as below.

```
        1 gatcctccat atacaacggt atctccacct caggtttaga tctcaacaac ggaaccattg
       61 ccgacatgag acagttaggt atcgtcgaga gttacaagct aaaacgagca gtagtcagct
      121 ctgcatctga agccgctgaa gttctactaa gggtggataa catcatccgt gcaagaccaa
      181 gaaccgccaa tagacaacat atgtaacata tttaggatat acctcgaaaa taataaaccg
      241 ccacactgtc attattataa ttagaaacag aacgcaaaaa ttatcc
```

## Termination

The record is then terminated with a line containing only "//"


## Sources

https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html
http://www.insdc.org/documents/feature-table

Niether of these are particularly useful in practice and so the BioPython
parser was used as a reference.

https://github.com/biopython/biopython/blob/master/Bio/GenBank/Scanner.py
